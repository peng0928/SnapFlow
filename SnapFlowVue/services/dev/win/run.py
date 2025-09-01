import sys
import os

# 强制替换 stdout/stderr，防止 None
sys.stdout = open(os.devnull, "w")
sys.stderr = open(os.devnull, "w")

# 告诉 mitmproxy 不要尝试终端
os.environ["MITMPROXY_NO_TTY"] = "1"
from mitmproxy.tools.main import mitmdump
from loguru import logger

port = '12028'

logger.info("开始运行")
# parser = argparse.ArgumentParser(description='控制运行环境的程序')

# parser.add_argument('-p', '--port', type=str, default='12028', help='端口')
# args = parser.parse_args()
logger.info(f"当前端口为：{port}")
# 获取当前工作路径
current_dir = os.path.dirname(os.path.abspath(__file__))
path_dir = current_dir + '/api.py'
print(path_dir)

if __name__ == '__main__':
    mitmdump(["-p", str(port), "-q", "-s", path_dir])
