# Bo intent mau Tieng Viet cho Dialogflow ES

Bo nay duoc thiet ke theo luong website hien tai cua ban (Vat ly + game roadmap).

## 1) Danh sach file
- `dialogflow/vi_intents_starter.json`: Bo intent mau (training phrase + response + chip goi y)

## 2) Cach train nhanh trong Dialogflow ES
1. Dang nhap: https://dialogflow.cloud.google.com/
2. Chon agent: `Physical-Assistant`
3. Vao `Intents` -> `Create Intent`
4. Dat ten intent theo `displayName` trong file JSON
5. Copy `trainingPhrases` vao phan Training phrases
6. Copy `responses` vao phan Text response
7. Neu co `suggestionChips`, them 1 custom payload cho Messenger theo mau ben duoi
8. Bam `Save` va lap lai cho cac intent

## 3) Mau custom payload cho suggestion chips (Dialogflow Messenger)
Doi text chip theo tung intent:

```json
{
  "richContent": [
    [
      {
        "type": "chips",
        "options": [
          { "text": "Vao roadmap vat ly" },
          { "text": "Hoc theo lop" },
          { "text": "Cong cu vat ly" }
        ]
      }
    ]
  ]
}
```

## 4) 3 entity nen tao them
1. `@lop` (Custom entity)
- Entries: 6, 7, 8, 9, 10, 11, 12
- Synonyms: lop 6, lớp 6, khoi 6, ...

2. `@chu_de_vat_ly` (Custom entity)
- Entries: dien hoc, quang hoc, co hoc, nhiet hoc, dao dong, song

3. `@muc_do` (Custom entity)
- Entries: de, trung binh, kho

## 5) Test nhanh sau khi train
- "vao roadmap vat ly"
- "choi game lop 10"
- "mo cong cu vat ly"
- "dang ky tai khoan"
- "xem profile"

Neu ban muon, minh se tao tiep ban `v2` gom context follow-up (hoi tiep theo y nguoi dung) de chat bot tu nhien hon.
