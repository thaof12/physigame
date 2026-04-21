# Dialogflow Chatbot Setup (PhysiGame)

## 1. Frontend integration status
The chatbot widget is integrated at app level and appears as a floating chat bubble.

Configured variables:
- `VITE_DF_PROJECT_ID`
- `VITE_DF_AGENT_ID`
- `VITE_DF_LANGUAGE_CODE`
- `VITE_DF_CHAT_TITLE`

## 2. Environment setup
1. Create `.env` in project root.
2. Copy values from `.env.example`.
3. Restart Vite dev server after editing `.env`.

## 3. Dialogflow CX: minimum agent setup
Use this as baseline in Dialogflow console.

1. Agent language: `vi`.
2. Region/location: keep same as your agent config (`global` in current widget).
3. Create intents below.

### Intent: `greet`
Training phrases:
- xin chao
- chao ban
- hello
- hi
- cho minh hoi

Response examples:
- Xin chao, minh la tro ly vat ly. Ban can giai bai, on tap ly thuyet hay tim game?
- Chao ban, minh co the huong dan cong thuc, bai tap va virtual lab.

### Intent: `ask_formula`
Training phrases:
- cong thuc tinh van toc la gi
- cong thuc luc day acsimet
- cong thuc dien tro
- cho toi cong thuc nhiet luong

Response template:
- Ban dang can cong thuc cho chu de nao? Vi du: co hoc, nhiet hoc, dien hoc, quang hoc.

### Intent: `ask_lesson`
Training phrases:
- bai nay thuoc chuong nao
- hoc vat ly lop 8 tu dau
- goi y bai hoc cho lop 9
- nen hoc bai nao truoc

Response examples:
- Neu ban hoc lop 8, minh goi y bat dau tu Co hoc, sau do den Nhiet hoc.
- Ban cho minh biet lop hoc de minh sap xep lo trinh chinh xac hon.

### Intent: `ask_game`
Training phrases:
- game nao de luyen dinh luat ohm
- cho toi game ve ap suat
- game vat ly lop 7
- toi muon choi virtual lab

Response examples:
- Ban co the thu game Circuit Builder de on dinh luat Ohm.
- Neu ban muon thuc hanh, vao Virtual Lab de lam thi nghiem ao.

### Intent: `goodbye`
Training phrases:
- tam biet
- bye
- hen gap lai

Response examples:
- Tam biet, khi can on vat ly thi quay lai nhe.

## 4. Useful entities (optional)
Create custom entities:

1. `@grade`
- lop 6
- lop 7
- lop 8
- lop 9
- lop 10
- lop 11
- lop 12

2. `@topic`
- co hoc
- nhiet hoc
- dien hoc
- quang hoc
- dao dong
- song

Map these entities in intent training phrases to improve classification.

## 5. Parameters and route logic
For intent `ask_formula` and `ask_lesson`, add parameters:
- `grade` from `@grade`
- `topic` from `@topic`

Prompt strategy in fulfillment:
- Missing both: ask grade first.
- Has grade but no topic: ask topic.
- Has topic but no grade: ask grade.

## 6. Suggested fulfillment response style
Use short responses in Vietnamese and offer 2-3 next actions.

Example:
- Ban dang hoc lop may?
- Ban muon on ly thuyet hay lam bai tap?
- Minh co the goi y game phu hop theo chu de.

## 7. Test checklist
In Dialogflow simulator, test these cases:
1. Greeting and fallback.
2. Asking formula without topic.
3. Asking lesson with grade only.
4. Asking game with topic.
5. Random sentence to verify fallback quality.

## 8. Optional next step: webhook (advanced)
If you want dynamic answers from your app database:
1. Enable webhook in Dialogflow CX fulfillment.
2. Build endpoint in your Node server (`server.cjs`) to return:
- recommended lesson
- recommended game route
- formula explanation

This allows chatbot answers to reflect user progress in PhysiGame.

## 9. Webhook is now implemented in this project
Webhook endpoint in backend:
- `POST /api/chatbot/webhook`

File location:
- `routes/chatbotWebhook.cjs`

### How to wire Dialogflow CX webhook
1. In Dialogflow CX, go to **Manage -> Webhooks**.
2. Create webhook URL:
	- Local dev: `http://localhost:5002/api/chatbot/webhook`
	- Production: `https://<your-domain>/api/chatbot/webhook`
3. Add request header:
	- Header name: `x-webhook-token`
	- Header value: same as `DIALOGFLOW_WEBHOOK_TOKEN` in your `.env`
4. In fulfillment for intents/pages, set tags to trigger behavior:
	- `goi_y_game` (or any tag containing `game`)
	- `goi_y_lo_trinh` (or any tag containing `lesson`)
	- `cong_thuc` (or any tag containing `formula`)

### Session parameters you can pass from Dialogflow
To get personalized responses, pass one of:
- `userEmail`
- `userId`

Optional parameters:
- `grade` (examples: `8`, `lop 8`)
- `topic` (examples: `co hoc`, `nhiet hoc`, `dien hoc`, `quang hoc`, `dao dong`, `song`)

Webhook response includes parameters:
- `suggested_route`
- `detected_grade`
- `detected_topic`
- `completed_games`

Additional personalized parameters:
- `completed_lessons`
- `avg_quiz_percent`
- `avg_game_percent`
- `weak_chapter`
- `strong_chapter`
- `focus_lesson_route`
- `review_route`

Use these parameters in Dialogflow responses or rich messages.

### Personalization logic now in webhook
If user is identified by `userEmail` or `userId`, webhook now reads:
- `game_results` for grade-based performance, completion rate, weak/strong chapter
- `lesson_completions` for quiz-based learning strength by chapter

Then chatbot response adapts to:
- Formula requests: includes current quiz level and review chapter route
- Lesson requests: suggests next focus chapter from weak area
- Game requests: suggests reinforcement based on weak chapter and grade progress

## 10. Vietnamese training seed (ready-to-use)
Seed file in project:
- `dialogflow/vi-intent-seed.json`

This file includes:
- 12 intents (greeting, formula, lesson path, game recommendation, review, progress...)
- 2 entities (`grade`, `topic`) with Vietnamese synonyms
- Training phrases in Vietnamese (both with and without accents)
- Suggested response templates and webhook tags

How to use quickly in Dialogflow CX:
1. Open the seed file and copy each intent block.
2. In Dialogflow CX, create intent with same `displayName`.
3. Paste `trainingPhrases` into Training phrases.
4. Paste one `responseTemplates` sentence into Agent response.
5. For intents that have `webhookTag`, set the same tag in Fulfillment and enable webhook call.
6. Add parameters `grade` and `topic` in intent when available.

Recommended order:
1. `greet`
2. `ask_formula`
3. `ask_lesson_path`
4. `ask_game_recommendation`
5. `ask_progress_check`
6. `fallback_recover`
