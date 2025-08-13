import subprocess
import os
import sys

from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

# 获取当前工作路径
current_dir = os.path.dirname(os.path.abspath(__file__))

python_path = current_dir + '/run/run'
print(python_path)


# 定义请求体模型
class PortRequest(BaseModel):
    port: str = "12028"


# subprocess.Popen([sys.executable, file_path, f'-p=12028'], shell=False)

# 创建FastAPI应用
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，生产环境应更严格
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头
)


# 定义POST接口
@app.post("/set_port")
async def set_port(request: PortRequest):
    """
    接收port参数的POST接口

    参数:
    - port: 字符串类型的端口号

    返回:
    - 包含接收到的port信息的JSON响应
    """
    port = request.port
    msg = ""
    try:
        subprocess.Popen([python_path, f'{port}'], shell=False)
    except Exception as e:
        msg = str(e)
    return {
        "data": "端口接收成功",
        "msg": msg,
        "path": current_dir,
        "port": request.port
    }


# 运行应用
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=12027, reload=False, workers=1)
