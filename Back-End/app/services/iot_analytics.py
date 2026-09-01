import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import LeituraSensor, Sensor, TipoSensor, ConsumoEnergia, Producao
from typing import Dict, Any

def get_sensor_anomalies(db: Session, fazenda_id: int, dias: int = 7) -> Dict[str, Any]:
    """
    Analisa leituras recentes dos sensores da fazenda e calcula Z-Score 
    para detectar anomalias (picos de temperatura ou queda brusca de umidade).
    Retorna os pontos anômalos.
    """
    limite = datetime.utcnow() - timedelta(days=dias)
    
    # Buscar sensores e leituras da fazenda
    sensores = db.query(Sensor).filter_by(fazenda_id=fazenda_id).all()
    sensor_ids = [s.id for s in sensores]
    
    if not sensor_ids:
        return {"anomalies": [], "message": "Nenhum sensor encontrado para esta fazenda."}
        
    leituras = db.query(LeituraSensor).filter(
        LeituraSensor.sensor_id.in_(sensor_ids),
        LeituraSensor.data_hora >= limite
    ).all()
    
    if not leituras:
        return {"anomalies": [], "message": "Nenhuma leitura recente encontrada."}
        
    # Converter para DataFrame
    df = pd.DataFrame([{
        "id": l.id,
        "sensor_id": l.sensor_id,
        "valor": l.valor,
        "data_hora": l.data_hora
    } for l in leituras])
    
    # Adicionar tipo do sensor
    sensor_tipos = {s.id: s.tipo.value for s in sensores}
    sensor_nomes = {s.id: s.nome for s in sensores}
    df["tipo"] = df["sensor_id"].map(sensor_tipos)
    df["sensor_nome"] = df["sensor_id"].map(sensor_nomes)
    
    anomalies = []
    
    # Analisar cada tipo separadamente
    for tipo in df["tipo"].unique():
        df_tipo = df[df["tipo"] == tipo].copy()
        df_tipo = df_tipo.sort_values(by="data_hora")
        
        # Calcular média e desvio padrão usando rolling window
        df_tipo["rolling_mean"] = df_tipo["valor"].rolling(window=6, min_periods=1).mean()
        df_tipo["rolling_std"] = df_tipo["valor"].rolling(window=6, min_periods=1).std()
        
        # Evitar divisão por zero
        df_tipo["rolling_std"] = df_tipo["rolling_std"].replace(0, 0.001)
        
        # Calcular Z-Score
        df_tipo["z_score"] = (df_tipo["valor"] - df_tipo["rolling_mean"]) / df_tipo["rolling_std"]
        
        # Considerar anomalia se Z-Score absoluto > 2.5
        anomalos = df_tipo[df_tipo["z_score"].abs() > 2.5]
        
        for _, row in anomalos.iterrows():
            anomalies.append({
                "sensor_nome": row["sensor_nome"],
                "tipo": row["tipo"],
                "data_hora": row["data_hora"].isoformat(),
                "valor_anomalo": round(row["valor"], 2),
                "z_score": round(row["z_score"], 2),
                "media_esperada": round(row["rolling_mean"], 2)
            })
            
    # Ordenar anomalias da mais recente para a mais antiga
    anomalies.sort(key=lambda x: x["data_hora"], reverse=True)
    
    return {
        "total_leituras_analisadas": len(df),
        "total_anomalias_encontradas": len(anomalies),
        "anomalies": anomalies[:50] # Retorna no máximo as 50 mais recentes
    }

def correlate_energy_production(db: Session, fazenda_id: int) -> Dict[str, Any]:
    """
    Correlaciona o consumo de energia mensal com a quantidade de produções ativas iniciadas
    no mês para calcular custos médios de infraestrutura.
    """
    # 1. Obter Consumo Energia
    consumos = db.query(ConsumoEnergia).filter_by(fazenda_id=fazenda_id).all()
    if not consumos:
        return {"correlation": []}
        
    df_consumo = pd.DataFrame([{
        "mes_ano": c.data.strftime("%Y-%m"),
        "consumo_kwh": c.consumo_kwh,
        "custo_reais": c.custo_reais
    } for c in consumos])
    
    # 2. Obter Produções
    producoes = db.query(Producao).filter_by(fazenda_id=fazenda_id).all()
    if not producoes:
        return {"correlation": []}
        
    df_prod = pd.DataFrame([{
        "mes_ano": p.data_inicio.strftime("%Y-%m"),
        "producao_id": p.id
    } for p in producoes])
    
    # Agrupar produções por mês
    df_prod_grouped = df_prod.groupby("mes_ano").count().reset_index()
    df_prod_grouped.rename(columns={"producao_id": "qtd_producoes"}, inplace=True)
    
    # 3. Mesclar (Merge) usando Pandas
    df_merged = pd.merge(df_consumo, df_prod_grouped, on="mes_ano", how="left")
    df_merged["qtd_producoes"] = df_merged["qtd_producoes"].fillna(0)
    
    # 4. Calcular métricas sintéticas
    # Evitar divisão por zero
    df_merged["custo_por_producao"] = df_merged.apply(
        lambda row: row["custo_reais"] / row["qtd_producoes"] if row["qtd_producoes"] > 0 else 0,
        axis=1
    )
    
    # Arredondar para visualização
    df_merged = df_merged.round(2)
    
    # Ordenar por data
    df_merged = df_merged.sort_values(by="mes_ano")
    
    return {
        "correlation": df_merged.to_dict(orient="records")
    }
