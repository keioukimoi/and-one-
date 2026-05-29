import csv
import json
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

TIME_SLOTS = [
    "9:15","9:45","10:15","10:45","11:15","11:45",
    "12:15","12:45","13:15","13:45","14:15","14:45",
    "15:15","15:45","16:15","16:45","17:15","17:45",
    "18:15","18:45","19:15","19:45"
]

JP_HOLIDAYS = {
    '2025-01-01','2025-01-13','2025-02-11','2025-02-23','2025-02-24',
    '2025-03-20','2025-04-29','2025-05-03','2025-05-04','2025-05-05',
    '2025-05-06','2025-07-21','2025-08-11','2025-09-15','2025-09-23',
    '2025-10-13','2025-11-03','2025-11-24',
    '2026-01-01','2026-01-12','2026-02-11','2026-02-23',
    '2026-03-20','2026-04-29','2026-05-03','2026-05-04','2026-05-05',
    '2026-07-20','2026-08-11','2026-09-21','2026-09-23',
    '2026-10-12','2026-11-03','2026-11-23',
}

rows = []
with open(r"C:\Users\nnani\Downloads\スプラッシュマウンテン_待ち時間記録テンプレ_2025-2026.csv",
          encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append(row)

def parse_date(s):
    parts = s.replace('/', '-').split('-')
    if len(parts) == 3:
        return f"{parts[0]}-{parts[1].zfill(2)}-{parts[2].zfill(2)}"
    return None

models = {}
for slot in TIME_SLOTS:
    col = f"待ち時間_{slot}"
    X_list, y_list = [], []
    has_holiday = False

    for row in rows:
        raw = row.get(col, "").strip()
        if raw == "" or raw == "-1":
            continue
        try:
            y_val = float(raw)
        except:
            continue

        date_str = parse_date(row.get("日付", ""))
        if not date_str:
            continue

        day_type = row.get("曜日区分", "").strip()
        weather  = row.get("天気", "").strip()
        try:
            max_temp = float(row.get("最高気温(℃)", 0) or 0)
            min_temp = float(row.get("最低気温(℃)", 0) or 0)
            precip   = float(row.get("降水量(mm)", 0) or 0)
        except:
            continue

        is_holiday = (date_str in JP_HOLIDAYS) or (day_type == '祝日')
        if is_holiday:
            has_holiday = True

        is_sat    = 1 if day_type == '土曜' else 0
        is_sun    = 1 if day_type == '日曜' else 0
        is_hol    = 1 if is_holiday else 0
        is_cloudy = 1 if weather == '曇' else 0
        is_rainy  = 1 if weather == '雨' else 0

        X_list.append([is_sat, is_sun, is_hol, is_cloudy, is_rainy, max_temp, min_temp, precip])
        y_list.append(y_val)

    n = len(y_list)
    if n < 5:
        models[slot] = {"status": "データなし", "n_samples": n}
        continue

    X = np.array(X_list)
    y = np.array(y_list)

    reg = LinearRegression().fit(X, y)
    y_pred = reg.predict(X)
    r2 = r2_score(y, y_pred)

    coef = reg.coef_
    models[slot] = {
        "status": "ok",
        "intercept":     round(float(reg.intercept_), 4),
        "saturday":      round(float(coef[0]), 4),
        "sunday":        round(float(coef[1]), 4),
        "holiday":       round(float(coef[2]), 4),
        "cloudy":        round(float(coef[3]), 4),
        "rainy":         round(float(coef[4]), 4),
        "max_temp":      round(float(coef[5]), 4),
        "min_temp":      round(float(coef[6]), 4),
        "precipitation": round(float(coef[7]), 4),
        "r2":            round(float(r2), 4),
        "n_samples":     n,
        "has_holiday_data": has_holiday,
    }

result = {"time_slots": TIME_SLOTS, "models": models}
print(json.dumps(result, ensure_ascii=False))
