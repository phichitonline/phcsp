#!/bin/bash

# สั่งให้สคริปต์หยุดทำงานทันทีหากมีคำสั่งใดรันล้มเหลว
set -e

$IMAGE_NAME = "amedake01x/phcsp-app"
TAG="latest"
WEBHOOK_URL="https://192.168.254.27:22091/hook?access_key=aELxFVrcmf8dKhU6ez6b9En0FH0r32jWo1RpLgEuPwPk8Rnl"

echo -e "\033[0;36m--- 1. Building Docker Image ---\033[0m"
docker build --platform linux/amd64 -t "${IMAGE_NAME}:${TAG}" .

echo -e "\033[0;36m--- 2. Pushing to Docker Hub ---\033[0m"
docker push "${IMAGE_NAME}:${TAG}"

echo -e "\033[0;36m--- 3. Triggering Deployment on aaPanel ---\033[0m"
# -k (or --insecure) ใช้เพื่อข้ามการตรวจสอบ SSL Certificate ของ aaPanel
curl -k -X POST "$WEBHOOK_URL"

echo -e "\n\033[0;32m--- 🎉 Deployment Pipeline Completed! ---\033[0m"