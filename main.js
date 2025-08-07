// ==UserScript==
// @name         Give me the PDF!
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  在右侧添加按钮下载PDF文件
// @author       You
// @match        https://basic.smartedu.cn/tchMaterial/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=smartedu.cn
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
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;
    downloadBtn.onmouseover = () => downloadBtn.style.background = '#45a049';
    downloadBtn.onmouseout = () => downloadBtn.style.background = '#4CAF50';

    // 添加到页面
    document.body.appendChild(downloadBtn);

    // 下载PDF的函数
    function downloadPDF(filename) {
        try {
            const pdfElement = document.querySelector("#pdfPlayerFirefox");
            if (!pdfElement) {
                alert('未找到PDF查看器，请确保页面已加载完成');
                return;
            }

            pdfElement.contentWindow.PDFViewerApplication.pdfDocument.getData()
                .then((d) => {
                    const dl = document.createElement('a');
                    dl.href = URL.createObjectURL(new Blob([d], {type: 'application/octet-stream'}));
                    dl.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
                    document.body.appendChild(dl);
                    dl.click();
                    document.body.removeChild(dl);
                    URL.revokeObjectURL(dl.href); // 释放内存
                })
                .catch(error => {
                    console.error('下载失败:', error);
                    alert(`下载失败: ${error.message || '未知错误'}`);
                });
        } catch (error) {
            console.error('发生错误:', error);
            alert('操作失败，请确保页面已完全加载');
        }
    }

    // 按钮点击事件
    downloadBtn.addEventListener('click', () => {
        const userFilename = prompt('请输入PDF文件名（无需输入扩展名）:', '文档');
        if (userFilename !== null) { // 用户点击了确定
            const filename = userFilename.trim() === '' ? '未命名文档' : userFilename;
            downloadPDF(filename);
        }
    });
})();
