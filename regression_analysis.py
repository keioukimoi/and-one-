#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
美女と野獣 待ち時間 重回帰分析スクリプト
2025/5/26〜2025/6/30 のデータを使用
"""

import csv
import json
import numpy as np
from datetime import datetime

CSV_PATH = r"C:\Users\nnani\Downloads\美女と野獣_待ち時間記録テンプレ_2025-2026.csv"
OUTPUT_PATH = r"C:\Users\nnani\Documents\andtwo\wait_time_model.json"

TIME_SLOTS = [
    '9:15', '9:45', '10:15', '10:45', '11:15', '11:45',
    '12:15', '12:45', '13:15', '13:45', '14:15', '14:45',
    '15:15', '15:45', '16:15', '16:45', '17:15', '17:45',
    '18:15', '18:45', '19:15', '19:45'
]

START_DATE = datetime(2025, 5, 26)
END_DATE   = datetime(2025, 6, 30)

def load_data():
    rows = []
    with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            date_str = row.get('日付', '').strip()
            try:
                date = datetime.strptime(date_str, '%Y/%m/%d')
            except ValueError:
                continue
            if date < START_DATE or date > END_DATE:
                continue
            rows.append(row)
    return rows

def build_features(row):
    day_type = row['曜日区分'].strip()
    weather  = row['天気'].strip()
    try:
        max_temp = float(row['最高気温(℃)'])
        min_temp = float(row['最低気温(℃)'])
        precip   = float(row['降水量(mm)'])
    except (ValueError, KeyError):
        return None

    is_sat     = 1.0 if day_type == '土曜' else 0.0
    is_sun     = 1.0 if day_type == '日曜' else 0.0
    is_holiday = 1.0 if day_type == '祝日' else 0.0
    is_cloudy  = 1.0 if weather == '曇'   else 0.0
    is_rainy   = 1.0 if weather == '雨'   else 0.0

    return [1.0, is_sat, is_sun, is_holiday, is_cloudy, is_rainy, max_temp, min_temp, precip]

def analyze_slot(rows, slot):
    col = f'待ち時間_{slot}'
    X_list, y_list = [], []
    n_minus_one = 0
    n_missing   = 0

    for row in rows:
        val_str = row.get(col, '').strip()
        if val_str == '-1':
            n_minus_one += 1
            continue
        if val_str == '':
            n_missing += 1
            continue
        try:
            val = float(val_str)
        except ValueError:
            n_missing += 1
            continue

        features = build_features(row)
        if features is None:
            n_missing += 1
            continue

        X_list.append(features)
        y_list.append(val)

    n = len(y_list)
    total = len(rows)

    # 全レコードが-1 → 常時運休スロット
    if n_minus_one == total:
        return {'status': '運休', 'n_samples': 0, 'n_minus_one': n_minus_one}

    # データ不足
    if n < 5:
        return {
            'status': 'データなし',
            'n_samples': n,
            'n_minus_one': n_minus_one,
            'n_missing': n_missing,
        }

    X = np.array(X_list)  # shape (n, 9)
    y = np.array(y_list)  # shape (n,)

    try:
        coeffs, _, rank, _ = np.linalg.lstsq(X, y, rcond=None)
        y_pred = X @ coeffs
        ss_res = float(np.sum((y - y_pred) ** 2))
        ss_tot = float(np.sum((y - np.mean(y)) ** 2))
        r2 = 1.0 - ss_res / ss_tot if ss_tot > 0 else 0.0

        # 祝日データがあったか
        holiday_col = X[:, 3]
        has_holiday_data = bool(np.any(holiday_col > 0))

        return {
            'status': 'ok',
            'intercept':     round(float(coeffs[0]), 4),
            'saturday':      round(float(coeffs[1]), 4),
            'sunday':        round(float(coeffs[2]), 4),
            'holiday':       round(float(coeffs[3]), 4),
            'cloudy':        round(float(coeffs[4]), 4),
            'rainy':         round(float(coeffs[5]), 4),
            'max_temp':      round(float(coeffs[6]), 4),
            'min_temp':      round(float(coeffs[7]), 4),
            'precipitation': round(float(coeffs[8]), 4),
            'r2':            round(r2, 4),
            'n_samples':     n,
            'n_minus_one':   n_minus_one,
            'n_missing':     n_missing,
            'has_holiday_data': has_holiday_data,
            'y_mean':        round(float(np.mean(y)), 2),
            'y_std':         round(float(np.std(y)),  2),
        }
    except Exception as e:
        return {'status': 'エラー', 'error': str(e), 'n_samples': n}

def main():
    rows = load_data()
    print(f"読み込んだ行数: {len(rows)}")

    models = {}
    for slot in TIME_SLOTS:
        result = analyze_slot(rows, slot)
        models[slot] = result
        status = result['status']
        n      = result.get('n_samples', 0)
        r2     = result.get('r2', '-')
        print(f"  {slot}: {status}, n={n}, R2={r2}")

    output = {
        'generated_at': datetime.now().isoformat(),
        'data_range': f'{START_DATE.date()} ~ {END_DATE.date()}',
        'n_total_rows': len(rows),
        'time_slots': TIME_SLOTS,
        'models': models,
    }

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nJSON出力: {OUTPUT_PATH}")

if __name__ == '__main__':
    main()
