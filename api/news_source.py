# coding:utf-8
import requests
from bs4 import BeautifulSoup
import json

import time

headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.66 Safari/537.36 Edg/103.0.1264.44"
}


def get_cookies(news_str):
    url_base = f"https://quark.sm.cn/s?q={news_str}"
    _ = requests.get(url_base, headers=headers)
    # soup = BeautifulSoup(_.text, 'lxml')
    # topic = soup.find_all("div", attrs={"class": "topic-news-m-eventlist"})
    return _.cookies


def get_news(_news_str, _cookies):
    # 将 news_str url 编码
    # 武汉大学确诊一例霍乱 学生：学习生活未受影响，可正常出入校门
    # %E6%AD%A6%E6%B1%89%E5%A4%A7%E5%AD%A6%E5%87%BA%E7%8E%B01%E4%BE%8B%E9%9C%8D%E4%B9%B1%EF%BC%8C%E6%A0%A1%E6%96%B9%EF%BC%9A%E4%B8%BA
    url = f"https://quark.sm.cn/api/rest?method=highquality.quality&format=tpl&path=news&app_id=news-listpage&hit=10&page_num=1&q={_news_str}"
    data = requests.get(url, headers=headers, cookies=_cookies)
    data_json = json.loads(data.text)
    soup = BeautifulSoup(data_json["tpl"], 'lxml')
    day_news = soup.find_all('li', attrs={"class": "y-feed-item"})
    datalist = []
    for i in day_news:
        title = i.find('p', attrs={"class": "y-feed-title"})
        data_from = i.find('span', attrs={"class": "y-feed-desc-source"})
        data_time = i.find('span', attrs={"class": "y-feed-desc-time"})
        data_href = i.find('a', attrs={"class": "y-padding-content"})
        data = {
            "title": str(title),
            "origin": data_from.text,
            "time": data_time.text,
            "href": data_href['href']
        }
        datalist.append(data)
    return datalist


# def get_weibo_live(_news_str, _cookies):
#     # 将 news_str url 编码
#     # 武汉大学确诊一例霍乱 学生：学习生活未受影响，可正常出入校门
#     # %E6%AD%A6%E6%B1%89%E5%A4%A7%E5%AD%A6%E5%87%BA%E7%8E%B01%E4%BE%8B%E9%9C%8D%E4%B9%B1%EF%BC%8C%E6%A0%A1%E6%96%B9%EF%BC%9A%E4%B8%BA
#     url = f"https://quark.sm.cn/api/rest?format=json&request_sc=shenma_weibo::weibo_strong&app_chain_name=service_chain&vendor=100002&bucket=document_exp_timeliness_opt%3Doff%26ab_subtopic_rerank_v2%3Dbucket_4%26delete_aggr_newsrank%3Dyes%26gaokao_lower%3Dyes%26uchq_cut_qmatch%3Dyes2%252Cgaokao%252Cupuv3%26game_baike_fix%3Don%26uchq_feed_no_uvlimit%3Dyes%26tlx_bidword%3Ddefault%26app_sc_trigger_style%3Dnew_style%26document_exp_college_merge_rerank%3Dbucket_2%26high_quality_content_v5%3Dbucket_3%26medical_cls_tag_pathologic_fow_bucket%3Doff%26makeupTimeSubcontext%3Doff%26ab_merge_parallel_v1%3Dbucket_1%26short_video_new%3Dnew4%26ab_rt_sourcer%3Dbucket_2%26medical_disease_recall%3Dmodel%26ab_parallel_ts_filter%3Dbucket_2%26college_trigger%3Don%26L4_restruct%3Dagg_web_para%26jxwd_deep_sum_v1%3Dfalse%26ab_feed_cache_time%3D30%26jxwd_red_v2%3Dfalse%26deep_sum_extend_trigger%3Dfalse%26ab_feed_agg_use_display_for_trans_code%3Dyes%26text_recommend_bottom%3Don%26query_ner_bucket%3Doff%26chan_bk%3Doff%26ab_feed_agg_rerank_hit_in_fetch_summary%3Dyes%26chan_bk_no_edu%3Doff%26ab_qlog_v9%3Dbucket_2%26bts_cst_test%3Dbucket_test%26high_quality_content_new%3Dnew_new%26zuesrecut%3Dbucket2%26ab_qp_or_logic_new%3Dbucket_3%26faiss_abtest_quark%3Dbucket_7%26short_video_app%3Dapp_test3%26L4_lgbm_qtteacher%3Dagg_addtsqt24l_nooldqt_mergegx%26EduStrategy_V%3Don%26shield_recommend%3Dbucket1%26app_adlist_yingyongbao%3Don%26large_summary%3Dbucket6struct%26search_tag_rec%3Dexp5%26ab_feed_uv_querydoc_link_enable_cache%3Dyes%26ab_news_uchq_stype_normalize_to_news%3Dyes%26feed_strategy_bucket%3Dbucket_2%26qtcnn_quark%3Dv2%26speck%3Dbucket_v0909_pub%257Ccheck_feedback%257Ctt_update%257Cadd_st_entity%26document_exp_doc%3Dqt_v2%26uchq_feed_test_server_name%3Dnewrt%26temp_insert_sc%3Don%26ab_uchq_strategy_add_kg_people%3Dyes%26ab_l3nn_gpu%3Don_l3gpu_l3nn_all%26finance_refactor_exp%3Dbucket_refactor%26ab_clickrecall_rerank_restruct%3Dbucket_2%26ab_simdoc_skip_jaccard%3Dbucket_2%26copyfeatfix%3Don%26ab_official_dedup%3Dbucket_3%26ab_click_uc%3Dbucket_1%26fresh_timeliness%3Dgame_exam%26cache_doc_black_check%3Dtrue%26ab_insert_by_fullmatch%3Dbucket_3_qa_main_default%26download_flag%3Don%26photo_question_l3_test%3Dbucket3%26page_shield%3Don%26medical_cls_tag_new_app_bucket%3Don%26map_busline_exp%3Dnew%26ab_etao_fix_pos%3Dfix_3_dp%26lynn_new_vec%3Dbucket8%26ab_qt_new_cache%3Dbucket_2%26timeliness_rerank%3Dbucket_2%26query_bidword%3Dbase%26train_number_lima%3Dnew%26app_6_element_all%3Dbucket2%26midpage_wenda%3Dreplace%26etao_shopping_trigger_recall%3Dbucket_3%26Edu_down%3Don%26ab_hostlogo%3Dbucket_2%26relative_search%3Dbucket_7%26s3ab%3Dhighlight%26operation_allergy%3Don%26medical_nocard%3Dopen%26medical_cls_tag_dis_candidate_free%3Doff%26yisou_wakuang%3Dbucket2%26trace_info%3Don%26uc_doc_trigger%3Don%26gouwu_liuliang%3Dother_low_1688%26estrs%3Dbucket_1_online%26photo_question_graph_search%3Don%26yisouvideo%3Dbucket3%26med_vertical%3Dopen%26tiny_app_dl%3Dbucket1%26grj_paral_qclassify%3Dgrj_paral_nointeract_repre%26doc_rerank%3Dac%26ab_vpt_desc%3Dbucket_1%26med_cls_drug_bucket%3Don%26sc_qtc_relevance%3Doff%26yiliao_adjust%3Dbucket_0%26ab_acnnv2_match%3Don_v2m_acnn_scold_match%26kkcpc%3Dadon2%26bucket_disable_img_dedup%3Dyes%26bucket_image_score%3D0.7%26photo_question_dedup_filter%3Dbucket1%26medicine_knowledge_card%3Dcontrast_mix%26IsUrlQuerySatisfy%3Doff%26sc_job_58_bucket_new%3Don%26medical_midpage%3Doff%26zw_sg_rank%3Don%26benediction_down%3Don%26ChiStrategy%3Don%26short_video_up%3Doff%26weibo_sort_v5%3Dyes%26weibo_sort_v3%3Dyes%26uc_kuying%3Doff%26game_liuliang%3Doff%26document_exp_text_score_cut%3Doff%26document_exp_quality_spam%3Dbucket_1%26feed_data%3Dtoutu_mix7%26estr_p4p%3Dbase%26paisoutoolsc_follow%3Doff%26document_exp_doc_tag_extract%3Ddocument_exp_doc_tag_extract_bucket0%26agg_damoyuan_opt%3Dyes%26zeus_spl%3Dbucket_2%26operation_mental%3Don%26ab_sc_rank%3Dbucket_2%26photo_question_souti_sc%3Dbucket2%26ab_qtcmlp_use_gpu%3Donline_on%26paa_recommend_mutex%3Dopen%26photo_question_ocr_souti_sc%3Dbucket2%26fow_recommend_mutex%3Dopen%26jxwd_red_v1%3Dtrue%26bd_icon_new%3Db13%26alihealth_wenzhen%3Dregister%26ab_official_spl_ow%3Dclose%26bd_icon_new_ios%3Dk13%26GQF_baike_sc_upup%3Don%26ab_etao_sc_protect%3Dbase_online%26kg_recommend_multi_dimension%3Ddefault%26ab_etao_medical_protect%3Dbase_online%26document_exp_close_cache%3Doff%26do_new_l5_qtc%3Donline_new%26medical_cls_tag_pathologic_tag_bucket%3Doff%26qu_request%3Don%26esqtc%3Dbucket_1%26weather_new%3Doff%26photo_question_text_exp%3Dl3_newintent_norm%26tongtianta_offline_v2%3Dbase%26faiss_relevance_cut%3Dopen%26qtc_use_multi%3Dyes%26timeliness_boost%3Dbucket_2%26ab_clickg_aggfeature%3Dbucket_4%26document_exp_close_page_filter%3Don%26ab_uchq_strategy_open_all_uc%3Dyes211%26major_up%3Don%26tiny_app_test%3Dbucket2%26photo_question_use_qe_version%3Dnew%26photo_question_text_recall%3Dbucket1%26prefetch_control%3Dopen%26app_newstyle%3Dold%26offline_recall_bucket%3D15%26entrance_exam_timeliness%3Dbucket_2%26medical_quark_disease%3Dbase%26document_exp_host_filter%3Doff%26shoutiao_qiehuan%3Dbucket2%26medical_cls_tag_nn_model_bucket%3Doff%26fyw_app_rerank%3Dbucket1%26ab_duplicate_removal_test2%3Dbucket_4%26esmakeup%3Dbucket_1%26ab_etao_display%3Don%26ab_ltr_dnn%3Don_ltrdnn_acnn_all%26ab_official_v5%3Dbucket_2%26bucket_content_queue_on%3Dbucket_2_on_new%26yxlady_liuliang%3Dhigh%26document_exp_qlog_trigger%3Doff%26hqc_img_adjust%3Dbucket_4%26operation_sleep%3Don%26youlai_boost%3Dopen%26jxwd_req_new%3Don%26uchq_feed_prot_finance%3Dyes%26ab_acnn_gpu%3Don_gpu_acnn_all%26host_cost%3Don%26photo_question_vip_exp%3Dbucket4%26fix_second_text_reco%3Don%26medical_selfdiagnosis_recommendation%3Dbucket_1%26grj_dynamic_intention%3Dbucket1%26document_exp_vector_recall%3Dbucket_1%26document_exp_quality_spam_watermark%3Dbucket_0%26summary_hl%3Dclose%26content_queue_build%3Dbucket_1%26document_exp_doc_filter_v2%3Dbucket_2%26GQF_baike_dedup4%3Don%26document_exp_mainbody_recall_exp%3Doff%26photo_question_text_show%3Dstyleold_base_basic%26news_sc_news_add%3Dgood%26ab_vpt_clk%3Dbucket_3%26jiuyouchannel%3Dbucket1%26bucket_cover_bottom_site%3Don%26faiss_new_qtc_ablation_quark%3Dqtc_qt_qtmix_v402%26feature_log_collector%3Doff%26ab_cover_bottom_emptysummary%3Don%26add_affect_sc_data%3Don%26document_exp_prior_filter%3Don%26tupianxiu_new%3Dnew1%26ab_request_norm_hit_qtc_for_uchq%3Dyes%26ab_fixed_change%3Dbucket_2%26ab_top_clk%3Dbucket_1%26fresh_select%3Dfirst%26medical_hqcontent%3Dopen%26ab_cp_v1%3Dbase%26verticalsearch%3Dbucket1%26document_exp_toutiao_search_open%3Don%26document_exp_makeup%3Doff%26medical_bertv2_align%3Don%26quark_search%3Don%26medical_midpage_new%3Dbase%26manga_new_offline%3Doff%26summary_badcut%3Don%26EduStrategy%3Don%26college_trigger_essay_filter%3Doff%26bucket_somato_timeliness%3Dbucket_3%26document_exp_blktair_filter%3Doff%26ab_feed_agg_show_new_images%3Dyes%26bucket_somato_timeliness_v3%3Dbucket_2%26zuowen_search_qtc_abtest%3Din_qtc%26tr_pos%3Ddefault&method=sc.weibo_strong&q={_news_str}&start=0&hit=30"
#     data = requests.get(url, headers=headers, cookies=_cookies)
#     data_json = json.loads(data.text)
#     soup = BeautifulSoup(data_json["tpl"], 'lxml')
#     day_news = soup.find_all('div', attrs={"class": "y-weibo-item"})
#     # print(day_news)
#     data_list = []
#     for i in day_news:
#         data_text = i.find('div', attrs={"class": "y-weibo-text"}).find("p")
#         data_from = i.find('div', attrs={"class": "y-weibo-name"})
#         data_time = i.find('div', attrs={"class": "y-weibo-time"})
#         data_href = i.find('a', attrs={"class": "y-weibo-user"})
#         data = {
#             "text": str(data_text),
#             "origin": data_from.text,
#             "time": data_time.text,
#             "href": data_href['href']
#         }
#         data_list.append(data)
#     return data_list


# def get_topic(topic):
#     topic_list = topic[0].find_all("li", attrs={"class": "js-c-timeline-item"})
#     topic_str = topic[0].find("div", attrs={"class": "c-header-inner"}).text
#     data_list = []
#     for i in topic_list:
#         data_str = i.find("div", attrs={"class": "c-header-title"})
#         data_link = i.find("a")
#         data_time = i.find("div", attrs={"class": "c-timeline-date"})
#         data = {
#             "title": str(data_str),
#             "origin": None,
#             "href": data_link['href'],
#             "time": str(data_time)
#         }
#         data_list.append(data)
#     return topic_str, data_list


# def main(_news_str, _type):
#     _cookies, _topic = get_cookies(_news_str)
#     if _topic:
#         topic_name, topic_data = get_topic(_topic)
#     else:
#         topic_name = None
#         topic_data = None
#     if _type == 'weibo':
#         try:
#             data = get_weibo_live(_news_str, _cookies)
#             suc = True
#         except Exception as e:
#             data = e
#             suc = False
#     else:
#         try:
#             data = get_news(_news_str, _cookies)
#             suc = True
#         except Exception as e:
#             data = e
#             suc = False
#     data_ret = {
#         'suc': suc,
#         'type': str(_type),
#         'time': time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
#         # 'topic': {
#         #     "topic_name": topic_name,
#         #     "topic_data": topic_data
#         # },
#         'data': data
#     }
#     return data_ret


def main(_news_str):
    _cookies = get_cookies(_news_str)
    try:
        data = get_news(_news_str, _cookies)
        suc = True
    except Exception as e:
        data = e
        suc = False
    data_ret = {
        'suc': suc,
        # 'type': str(_type),
        'time': time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
        # 'topic': {
        #     "topic_name": topic_name,
        #     "topic_data": topic_data
        # },
        'data': data
    }
    return data_ret
