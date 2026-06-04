---
id: common-commands
title: Linux 常用命令速查
cat: tools-1
date: 2026-06-01
level: 入门
tags: ["Linux", "命令", "效率", "速查"]
---

## 文件操作

```
# 查找大文件
find / -type f -size +100M 2>/dev/null | head -20

# 批量重命名
for f in *.txt; do mv "$f" "${f%.txt}.md"; done

# 按修改时间排序
ls -lt | head -20

# 统计文件数
ls -1 | wc -l

# 软链接
ln -s /path/to/origin /path/to/link
```

## 系统监控

```
# CPU 占用最高的进程
ps aux --sort=-%cpu | head -10

# 内存占用
free -h

# 磁盘 IO
iostat -x 1 5

# 网络连接
ss -tulnp

# 系统负载
uptime

# 实时监控
top / htop
```

## 网络诊断

```
# 测试端口连通性
nc -zv 192.168.1.100 80

# 路由追踪
traceroute google.com

# DNS 查询
dig +short google.com

# 公网 IP
curl ifconfig.me

# 监控带宽
iftop -i eth0
```

## 文本处理

```
# 统计文件行数
wc -l file.txt

# 查找大文件
find . -size +1M -exec ls -lh {} \;

# 替换文本
sed -i 's/old/new/g' file.txt

# 提取列
awk '{print $1}' file.txt

# 排序去重
sort file.txt | uniq -c | sort -rn

# 实时日志
tail -f /var/log/syslog
```

## 进程管理

```
# 查看进程
ps aux | grep nginx

# 杀进程
kill -9 PID

# 后台运行
nohup command &

# 查看打开文件
lsof -p PID

# 进程资源
ps -p PID -o pid,ppid,%cpu,%mem,cmd
```

## 压缩解压

```
tar -czvf archive.tar.gz dir/
tar -xzvf archive.tar.gz
zip -r archive.zip dir/
unzip archive.zip
7z a archive.7z dir/
7z x archive.7z
```

## 权限管理

```
# 改权限
chmod 755 file.sh
chown user:group file.txt

# 递归改
chmod -R 755 dir/

# 找 SUID 文件
find / -perm -u=s -type f 2>/dev/null
```
