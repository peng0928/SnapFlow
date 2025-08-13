import json
import socket
import time
from datetime import datetime
from mitmproxy import http
from loguru import logger

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
TCP_IP = "127.0.0.1"
TCP_PORT = 2025


def get_timings(flow):
    """计算时间指标"""
    start_time = flow.request.timestamp_start
    end_time = flow.response.timestamp_end
    return {
        "start": start_time,
        "end": end_time,
        "cost": round(end_time - start_time, 3)
    }


def send_to_tcp(data):
    """通过TCP发送数据（自动重连）"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect((TCP_IP, TCP_PORT))
            s.sendall(json.dumps(data).encode())
    except Exception as e:
        logger.error(f"TCP发送失败: {e}")


def handle_type(headers, text, url):
    content_type = headers.get("Content-Type") or headers.get("content-type") or ""
    content_type_mapping = {
        # 文本类型
        "text/html": "HTML",
        "text/plain": "TEXT",
        "text/xml": "XML",
        "javascript": "JS",
        "application/javascript": "JS",
        "text/javascript": "JS",
        "text/css": "CSS",

        # 图片类型
        "image/gif": "Gif",
        "image/jpeg": "JPG",
        "image/png": "PNG",

        # 应用类型
        "application/xhtml+xml": "xhtml",
        "application/xml": "Xml",
        "application/atom+xml": "atom",
        "application/json": "JSON",
        "application/pdf": "PDF",
        "application/msword": "Word",
        "application/octet-stream": "binary",
        "application/x-www-form-urlencoded": "form",
        "application/zip": "zip",

        # 其他常见类型
        "multipart/form-data": "multipart"
    }
    file_type_mapping = {
        ".js": "JS",
        ".json": "JSON",
        ".css": "CSS",
        ".html": "HTML",
        ".jpg": "JPG",
        ".png": "PNG",
        ".gif": "Gif",
        ".pdf": "Pdf",
        ".doc": "Word",
        ".docx": "Word",
        ".xls": "Excel",
        ".xlsx": "Excel",
        ".ppt": "PPT",
        ".pptx": "PPT",
        ".rar": "rar",
        ".7z": "7z",
        ".tar": "tar",
        ".gz": "gz",
        ".bz2": "bz2",
        ".zip": "zip",
        ".mp3": "mp3",
        ".mp4": "mp4",
        ".avi": "avi",
    }

    for prefix, type_name in content_type_mapping.items():
        if content_type.startswith(prefix):
            content_type = type_name
            break
    try:
        json.loads(text)
        return "JSON"
    except Exception:
        pass
    for suffix, type_name in file_type_mapping.items():
        if url.endswith(suffix):
            content_type = type_name
            break

    return content_type


def request(flow: http.HTTPFlow):
    """发送请求数据"""
    data = {
        "id": hash(f"{flow.id}-{time.time()}"),  # 生成唯一ID
        "method": flow.request.method,
        "url": flow.request.url,
        "type": flow.type,
        "size": len(flow.request.content) if flow.request.content else 0,
        "time": flow.request.timestamp_start,  # 时间戳（可格式化为字符串）
        "requestHeaders": dict(flow.request.headers),
        "requestBody": flow.request.text,
        "timings": None  # 请求阶段无法计算完整timings
    }
    # print(flow.request)
    # send_to_tcp(data)


def to_dict(data):
    return dict(data.items())


def response(flow: http.HTTPFlow):
    """发送响应数据"""
    responseHeaders = dict(flow.response.headers) or {}
    content = flow.response.content
    text = content.decode(errors='ignore')
    url = flow.request.url
    scheme = flow.request.scheme
    params = to_dict(flow.request.query)
    date_now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    body = ""
    if flow.request.urlencoded_form:
        body = to_dict(flow.request.urlencoded_form)
    try:
        body = flow.request.json()
    except:
        pass
    data = {
        "id": hash(f"{flow.id}-{time.time()}"),  # 需与请求相同ID
        "method": flow.request.method,
        "url": url,
        "host": flow.request.host,
        "status": flow.response.status_code,
        "type": handle_type(responseHeaders, text, url),
        "scheme": scheme,
        "text": text,
        "datetime": date_now,
        "params": params,
        "body": body,
        "content": "",
        "cookie": "",
        "size": len(flow.response.content) if flow.response.content else 0,
        "time": flow.response.timestamp_end,
        "requestHeaders": dict(flow.request.headers),
        "responseHeaders": responseHeaders,
        "responseBody": text,
        "timings": get_timings(flow)  # 计算耗时
    }

    send_to_tcp(data)


def websocket_message(flow: http.HTTPFlow):
    # 检查是否是 WebSocket 消息
    pass


logger.info("mitmdump启动成功")
