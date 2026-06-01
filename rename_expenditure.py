import os
import re

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        print(f"Skipping {filepath} due to decoding error.")
        return

    original = content
    
    # Text replacements
    replacements = {
        '"expenditure"': '"spending"',
        "'expenditure'": "'spending'",
        'expendAcc': 'spendingAcc',
        'Expenditure Account': 'Spending Wallet',
        'Expenditure account': 'Spending wallet',
        'expenditure account': 'spending wallet',
        'Expenditure Balance': 'Spending Balance',
        'expenditure opening balance': 'spending opening balance',
        'highest expenditure category': 'highest spending category',
        'expenditure trends': 'spending trends',
        'expenditure entries': 'spending entries',
        'Savings Account': 'Savings Wallet',
        'savings account': 'savings wallet',
        'Top Up': 'Move from Savings',
        'Budget exceeded': 'Over your target',
        "You've overspent": "You've spent",
        'Opening Balance': 'Starting Balance',
        'opening-transfer': 'starting-transfer'
    }

    ordered_keys = [
        '"expenditure"', "'expenditure'", 'expendAcc',
        'Expenditure Account', 'Expenditure account', 'expenditure account',
        'Expenditure Balance', 'expenditure opening balance',
        'highest expenditure category', 'expenditure trends', 'expenditure entries',
        'Savings Account', 'savings account', 'Top Up', 'Budget exceeded',
        "You've overspent", 'Opening Balance', 'opening-transfer'
    ]
    
    for k in ordered_keys:
        content = content.replace(k, replacements[k])

    content = re.sub(r'\bExpenditure\b', 'Spending', content)
    content = re.sub(r'\bexpenditure\b', 'spending', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            replace_in_file(os.path.join(root, file))

