# PDF下载助手 - 智慧教育平台油猴脚本

## 简介

这是一个专为智慧教育平台（`https://basic.smartedu.cn/`）设计的油猴脚本，它允许您一键下载平台上显示的教材PDF文件。通过添加一个便捷的浮动按钮，您可以绕过平台限制，直接保存教材PDF到本地设备。


## 功能特点

- 🚀 一键下载当前教材PDF
- ✏️ 自定义文件名功能
- 🎯 固定在页面右侧的悬浮按钮

## 安装指南

### 第一步：安装油猴插件
1. 在浏览器中打开油猴插件官网：
2. 点击"添加到浏览器"完成安装

### 第二步：安装脚本

1. 复制以下完整脚本代码：

```javascript
// ==UserScript==
// @name         PDF下载助手 - 智慧教育平台
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  一键下载智慧教育平台的教材PDF
// @author       YourName
// @match        https://basic.smartedu.cn/tchMaterial/*
// @icon         https://basic.smartedu.cn/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 创建下载按钮
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = '下载PDF';
    downloadBtn.style.cssText = `
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 9999;
        padding: 12px 24px;
        background: linear-gradient(135deg, #4CAF50, #2E7D32);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        transition: all 0.3s ease;
        font-family: 'Microsoft YaHei', sans-serif;
    `;
    downloadBtn.onmouseover = () => downloadBtn.style.boxShadow = '0 6px 15px rgba(0,0,0,0.3)';
    downloadBtn.onmouseout = () => downloadBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';

    // 添加按钮动画效果
    downloadBtn.addEventListener('click', () => {
        downloadBtn.style.transform = 'translateY(-50%) scale(0.95)';
        setTimeout(() => {
            downloadBtn.style.transform = 'translateY(-50%)';
        }, 100);
    });

    // 添加到页面
    document.body.appendChild(downloadBtn);

    // 下载PDF的函数
    function downloadPDF(filename) {
        try {
            // 检查PDF查看器是否加载
            const pdfElement = document.querySelector("#pdfPlayerFirefox");
            if (!pdfElement) {
                showNotification('❌ 未找到PDF查看器，请确保页面已加载完成', 'error');
                return;
            }

            // 添加加载指示器
            const originalText = downloadBtn.textContent;
            downloadBtn.textContent = '下载中...';
            downloadBtn.style.opacity = '0.7';
            downloadBtn.style.cursor = 'wait';

            pdfElement.contentWindow.PDFViewerApplication.pdfDocument.getData()
                .then((d) => {
                    const dl = document.createElement('a');
                    dl.href = URL.createObjectURL(new Blob([d], {type: 'application/octet-stream'}));
                    dl.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
                    document.body.appendChild(dl);
                    dl.click();
                    document.body.removeChild(dl);
                    URL.revokeObjectURL(dl.href); // 释放内存

                    // 恢复按钮状态
                    downloadBtn.textContent = originalText;
                    downloadBtn.style.opacity = '1';
                    downloadBtn.style.cursor = 'pointer';

                    showNotification(`✅ 下载成功: ${filename}.pdf`, 'success');
                })
                .catch(error => {
                    console.error('下载失败:', error);
                    showNotification(`❌ 下载失败: ${error.message || '请检查控制台获取详情'}`, 'error');
                    
                    // 恢复按钮状态
                    downloadBtn.textContent = originalText;
                    downloadBtn.style.opacity = '1';
                    downloadBtn.style.cursor = 'pointer';
                });
        } catch (error) {
            console.error('发生错误:', error);
            showNotification('❌ 操作失败，请确保页面已完全加载', 'error');
        }
    }

    // 显示通知函数
    function showNotification(message, type) {
        // 移除现有通知
        const existingNotif = document.getElementById('pdf-download-notification');
        if (existingNotif) existingNotif.remove();

        const notif = document.createElement('div');
        notif.id = 'pdf-download-notification';
        notif.textContent = message;
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            background: ${type === 'error' ? '#ff6b6b' : '#4CAF50'};
            color: white;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            transition: opacity 0.5s;
            opacity: 0;
            animation: fadeIn 0.3s forwards, fadeOut 0.5s 2.5s forwards;
        `;
        
        // 添加动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; top: 0; }
                to { opacity: 1; top: 20px; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notif);
        
        // 自动移除通知
        setTimeout(() => {
            if (notif.parentNode) notif.parentNode.removeChild(notif);
        }, 3000);
    }

    // 按钮点击事件
    downloadBtn.addEventListener('click', () => {
        const defaultName = document.title.replace(' - 智慧教育平台', '') || '教材文档';
        const userFilename = prompt('请输入PDF文件名（无需输入扩展名）:', defaultName);
        if (userFilename !== null) { // 用户点击了确定
            const filename = userFilename.trim() === '' ? '未命名文档' : userFilename;
            downloadPDF(filename);
        }
    });

    // 添加使用说明提示
    window.addEventListener('load', () => {
        setTimeout(() => {
            showNotification('💡 提示：点击右侧"下载PDF"按钮保存教材', 'info');
        }, 5000);
    });
})();
```

2. 打开油猴插件 → 点击"添加新脚本"
3. 清空编辑器 → 粘贴复制的代码 → 保存（Ctrl+S）

## 使用说明

1. 访问智慧教育平台的教材页面
2. **等待PDF完全加载**
3. 在页面右侧找到绿色"下载PDF"按钮
4. 点击按钮 → 输入文件名 → 点击"确定"
5. 下载将自动开始，完成后会有成功提示

## 免责声明

本脚本仅用于教育目的，请勿用于商业用途或侵犯版权。下载的教材仅限个人学习使用，请尊重知识产权并在下载后24小时内删除。

---

**最后更新**：2025年8月7日  
