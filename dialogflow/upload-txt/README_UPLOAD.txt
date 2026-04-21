DIALOGFLOW CX QUICK UPLOAD (TXT)

1) Tao Entity grade
- Entity name: grade
- Import/Upload danh sach tu: dialogflow/upload-txt/entity_grade.txt
- Neu UI khong co nut upload, copy tung dong vao bang Entity Entry.

2) Tao Entity topic
- Entity name: topic
- Import/Upload danh sach tu: dialogflow/upload-txt/entity_topic.txt

3) Tao cac Intent va nap file phrase
- greet -> dialogflow/upload-txt/intent_greet_phrases.txt
- ask_formula -> dialogflow/upload-txt/intent_ask_formula_phrases.txt
- ask_lesson_path -> dialogflow/upload-txt/intent_ask_lesson_path_phrases.txt
- ask_game_recommendation -> dialogflow/upload-txt/intent_ask_game_recommendation_phrases.txt
- ask_progress_check -> dialogflow/upload-txt/intent_ask_progress_check_phrases.txt
- fallback_recover -> dialogflow/upload-txt/intent_fallback_recover_phrases.txt

3.1) Nap cau tra loi mau (Responses)
- greet -> dialogflow/upload-txt/intent_greet_responses.txt
- ask_formula -> dialogflow/upload-txt/intent_ask_formula_responses.txt
- ask_lesson_path -> dialogflow/upload-txt/intent_ask_lesson_path_responses.txt
- ask_game_recommendation -> dialogflow/upload-txt/intent_ask_game_recommendation_responses.txt
- ask_progress_check -> dialogflow/upload-txt/intent_ask_progress_check_responses.txt
- fallback_recover -> dialogflow/upload-txt/intent_fallback_recover_responses.txt

3.2) Prompt cho parameter Required (tieng Viet)
- Dung file: dialogflow/upload-txt/parameter_prompts_vi.txt
- Paste cac dong prompt vao phan Required prompt cua parameter grade/topic.
- Neu dang dung webhook ca nhan hoa, nen tat Required de bot khong hoi cuong buc.

Moi intent:
- Paste file *_phrases.txt vao Training phrases
- Paste 1-3 dong tu file *_responses.txt vao Responses

4) Gan webhook tag (neu dung webhook)
- ask_formula -> cong_thuc
- ask_lesson_path -> goi_y_lo_trinh
- ask_game_recommendation -> goi_y_game
- ask_progress_check -> goi_y_lo_trinh

5) Test nhanh trong simulator
- minh can cong thuc dien hoc lop 9
- goi y game cho co hoc lop 8
- minh hoc toi dau roi

Luu y:
- Entity name chi dung ky tu: a-z, A-Z, 0-9, _, -
- Dung @grade va @topic khi gan parameter trong intent.
