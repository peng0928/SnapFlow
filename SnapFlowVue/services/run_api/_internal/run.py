from mitmproxy.tools.main import mitmdump
import os
import argparse
from loguru import logger

logger.add("log.log")
parser = argparse.ArgumentParser(description='控制运行环境的程序')

parser.add_argument('-p', '--port', type=str, default='12028', help='端口')
args = parser.parse_args()
port = args.port

logger.info(f"当前端口为：{port}")
# 获取当前工作路径
current_dir = os.path.dirname(os.path.abspath(__file__))

if __name__ == '__main__':
    mitmdump(["-p", str(port), "-q", "-s", f"{current_dir}/api.py"])
