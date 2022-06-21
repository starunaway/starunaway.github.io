# git 配置

- `git config --global user.name "username"` 配置用户名，即提交后显示的用户名

- `git config --global user.email "email"` 用户邮箱，仓库统计提交次数会校验这个邮箱。可以在每个项目使用 `git config --local user.email` 配置每个项目的邮箱

- `git remote add 远程仓库名 远程仓库地址` 为项目增加远程仓库，每个项目可以有多个远程仓库，使用`git pull repo1`来分别拉去和提交

- `ssh-keygen -t rsa -C "username@mail.com" -f ~/.ssh/密钥名` 生成密钥，邮箱会用 commit 统计次数，可以为不同的库生成多个

- 在对应仓库添加 git 公钥

- `git push --set-upstream 远程仓库名 本地分支名`可以将本地分支推送到远程仓库，后续该分支不用再指定
- 可以通过 `git config --global --list` 显示配置

## config 文件的内容

```bash
# gitee
Host gitee.com
HostName gitee.com
PreferredAuthentications publickey
IdentityFile ~/.ssh/gitee_id_rsa

# github
Host github.com
HostName github.com
PreferredAuthentications publickey
IdentityFile ~/.ssh/密钥名


# github111
Host github.com
HostName github.com
PreferredAuthentications publickey
IdentityFile ~/.ssh/密钥名111

# 可以为多个仓库指定密钥路径，push/pull的时候会自动验证指定文件的内容

```

`.ssh`目录结构

```bash
.ssh-
    |--config
	|--密钥名
	|--密钥名.pub
	|--密钥名111
	|--密钥名111.pub
```

## 如何新建/修改 config 文件

需要使用 vim

```bash
cd ~
vim config
```

按 `i` 进入 `insert` 模式,可以使用鼠标右键进行复制粘贴,修改完成后需要先按下 `Esc` 退出 `insert` 模式, 再直接输入 `:wq` 保存并退出即可 (shift+; 同时按,再依次按 w q)
注意: 区分大小写
