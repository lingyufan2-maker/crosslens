每次完成代码修改后，必须执行：
npm run build

如果 build 通过，并且本次任务需要上线，请继续执行：
powershell -ExecutionPolicy Bypass -File ./deploy.ps1 "本次修改内容"

不要提交 .env.local。
不要提交任何真实 API key。
如果 build 失败，停止，不要 push，并告诉用户具体报错。
