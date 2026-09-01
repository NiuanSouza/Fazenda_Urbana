"""
Popula o banco com dados de sensores, irrigação e energia.
Execute com:  python -m app.seed_iot
"""
import random
from datetime import date, datetime, timedelta

from app.database import Base, SessionLocal, engine
from app.models import (
    ConsumoEnergia,
    EventoIrrigacao,
    LeituraSensor,
    Sensor,
    StatusIrrigacao,
    StatusSensor,
    TipoIrrigacao,
    TipoSensor,
    ZonaIrrigacao,
)


def seed_iot():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(Sensor).count() > 0:
            print("Dados IoT já existem. Pulando seed_iot.")
            return

        random.seed(42)
        hoje = date.today()

        # ── Sensores ──────────────────────────────────────────────────────
        sensores = [
            Sensor(nome="Temp. Estufa A", tipo=TipoSensor.temperatura, localizacao="Estufa A - Centro", unidade="°C", status=StatusSensor.online, data_instalacao=date(2025, 6, 1)),
            Sensor(nome="Temp. Estufa B", tipo=TipoSensor.temperatura, localizacao="Estufa B - Centro", unidade="°C", status=StatusSensor.online, data_instalacao=date(2025, 6, 1)),
            Sensor(nome="Temp. Área Externa", tipo=TipoSensor.temperatura, localizacao="Área Externa", unidade="°C", status=StatusSensor.online, data_instalacao=date(2025, 8, 15)),
            Sensor(nome="Umid. Estufa A", tipo=TipoSensor.umidade, localizacao="Estufa A - Solo", unidade="%", status=StatusSensor.online, data_instalacao=date(2025, 6, 1)),
            Sensor(nome="Umid. Estufa B", tipo=TipoSensor.umidade, localizacao="Estufa B - Solo", unidade="%", status=StatusSensor.online, data_instalacao=date(2025, 6, 1)),
            Sensor(nome="Umid. Ar Estufa A", tipo=TipoSensor.umidade, localizacao="Estufa A - Aéreo", unidade="%", status=StatusSensor.online, data_instalacao=date(2025, 7, 10)),
            Sensor(nome="pH Solução Nutritiva", tipo=TipoSensor.ph, localizacao="Sala de Nutrientes", unidade="pH", status=StatusSensor.online, data_instalacao=date(2025, 9, 1)),
            Sensor(nome="pH Tanque Irrigação", tipo=TipoSensor.ph, localizacao="Tanque Principal", unidade="pH", status=StatusSensor.manutencao, data_instalacao=date(2025, 9, 1)),
            Sensor(nome="Lux Estufa A", tipo=TipoSensor.luminosidade, localizacao="Estufa A - Teto", unidade="lux", status=StatusSensor.online, data_instalacao=date(2025, 6, 1)),
            Sensor(nome="Lux Área Externa", tipo=TipoSensor.luminosidade, localizacao="Área Externa - Telhado", unidade="lux", status=StatusSensor.offline, data_instalacao=date(2025, 8, 15)),
        ]
        for s in sensores:
            db.add(s)
        db.flush()

        # ── Leituras de Sensores (90 dias de histórico, 4x ao dia) ────────
        leituras = []
        for dia_offset in range(90, -1, -1):
            dt_base = datetime.combine(hoje - timedelta(days=dia_offset), datetime.min.time())
            for hora in [6, 10, 14, 18]:
                dt = dt_base.replace(hour=hora, minute=random.randint(0, 59))

                # Temperatura Estufa A (22-30°C)
                leituras.append(LeituraSensor(sensor_id=1, valor=round(random.uniform(22, 30), 1), data_hora=dt))
                # Temperatura Estufa B (20-28°C)
                leituras.append(LeituraSensor(sensor_id=2, valor=round(random.uniform(20, 28), 1), data_hora=dt))
                # Temperatura Externa (15-35°C, mais variação)
                leituras.append(LeituraSensor(sensor_id=3, valor=round(random.uniform(15, 35), 1), data_hora=dt))
                # Umidade Solo Estufa A (55-85%)
                leituras.append(LeituraSensor(sensor_id=4, valor=round(random.uniform(55, 85), 1), data_hora=dt))
                # Umidade Solo Estufa B (50-80%)
                leituras.append(LeituraSensor(sensor_id=5, valor=round(random.uniform(50, 80), 1), data_hora=dt))
                # Umidade Ar Estufa A (60-90%)
                leituras.append(LeituraSensor(sensor_id=6, valor=round(random.uniform(60, 90), 1), data_hora=dt))
                # pH Solução (5.5-7.0)
                leituras.append(LeituraSensor(sensor_id=7, valor=round(random.uniform(5.5, 7.0), 2), data_hora=dt))
                # pH Tanque (5.8-7.2)
                leituras.append(LeituraSensor(sensor_id=8, valor=round(random.uniform(5.8, 7.2), 2), data_hora=dt))
                # Luminosidade Estufa A (depende da hora)
                lux_base = {6: 5000, 10: 25000, 14: 35000, 18: 8000}
                leituras.append(LeituraSensor(sensor_id=9, valor=round(lux_base[hora] + random.uniform(-3000, 3000), 0), data_hora=dt))
                # Luminosidade Externa
                lux_ext = {6: 8000, 10: 45000, 14: 60000, 18: 12000}
                leituras.append(LeituraSensor(sensor_id=10, valor=round(lux_ext[hora] + random.uniform(-5000, 5000), 0), data_hora=dt))

        db.bulk_save_objects(leituras)
        db.flush()
        print(f"  → {len(leituras)} leituras de sensores criadas")

        # ── Zonas de Irrigação ────────────────────────────────────────────
        zonas = [
            ZonaIrrigacao(nome="Estufa A - Hortaliças", tipo_sistema="gotejamento", area_m2=120, status=StatusIrrigacao.ativa),
            ZonaIrrigacao(nome="Estufa B - Frutas", tipo_sistema="microaspersão", area_m2=95, status=StatusIrrigacao.ativa),
            ZonaIrrigacao(nome="Canteiro Externo", tipo_sistema="aspersão", area_m2=60, status=StatusIrrigacao.ativa),
            ZonaIrrigacao(nome="Viveiro de Mudas", tipo_sistema="gotejamento", area_m2=30, status=StatusIrrigacao.ativa),
            ZonaIrrigacao(nome="Jardim Vertical", tipo_sistema="gotejamento", area_m2=15, status=StatusIrrigacao.manutencao),
        ]
        for z in zonas:
            db.add(z)
        db.flush()

        # ── Eventos de Irrigação (90 dias, 2-3x por dia por zona) ─────────
        eventos = []
        for dia_offset in range(90, -1, -1):
            dt_base = datetime.combine(hoje - timedelta(days=dia_offset), datetime.min.time())
            for zona_id in range(1, 6):
                # Zona em manutenção: menos eventos
                n_eventos = random.randint(1, 2) if zona_id == 5 else random.randint(2, 3)
                for _ in range(n_eventos):
                    hora_inicio = random.randint(5, 20)
                    duracao_min = random.randint(15, 60)
                    inicio = dt_base.replace(hour=hora_inicio, minute=random.randint(0, 30))
                    fim = inicio + timedelta(minutes=duracao_min)
                    # Volume proporcional à área e duração
                    area = [120, 95, 60, 30, 15][zona_id - 1]
                    volume = round(area * duracao_min * random.uniform(0.02, 0.06), 2)
                    tipo = TipoIrrigacao.automatico if random.random() < 0.8 else TipoIrrigacao.manual
                    eventos.append(EventoIrrigacao(
                        zona_id=zona_id, data_inicio=inicio, data_fim=fim,
                        volume_litros=volume, tipo=tipo,
                    ))

        db.bulk_save_objects(eventos)
        db.flush()
        print(f"  → {len(eventos)} eventos de irrigação criados")

        # ── Consumo de Energia (90 dias) ──────────────────────────────────
        consumos = []
        for dia_offset in range(90, -1, -1):
            dt = hoje - timedelta(days=dia_offset)
            # Consumo da rede (20-45 kWh/dia)
            kwh_rede = round(random.uniform(20, 45), 2)
            custo_rede = round(kwh_rede * random.uniform(0.75, 0.95), 2)
            consumos.append(ConsumoEnergia(data=dt, consumo_kwh=kwh_rede, custo_reais=custo_rede, fonte="rede"))
            # Geração solar (5-18 kWh/dia, depende do "sol")
            kwh_solar = round(random.uniform(5, 18), 2)
            consumos.append(ConsumoEnergia(data=dt, consumo_kwh=kwh_solar, custo_reais=0, fonte="solar"))

        db.bulk_save_objects(consumos)
        db.flush()
        print(f"  → {len(consumos)} registros de energia criados")

        db.commit()
        print("✅ Seed IoT concluído com sucesso!")

    except Exception as e:
        db.rollback()
        print(f"❌ Erro no seed IoT: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_iot()
