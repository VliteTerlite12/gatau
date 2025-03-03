const { makeWASocket, useMultiFileAuthState, downloadContentFromMessage } = require('@fizzxydev/baileys-pro');
const pino = require('pino');
const { createSticker, StickerTypes } = require('wa-sticker-formatter');
const axios = require('axios');
const util = require('util');
const fs = require('fs');
const yts = require('yt-search');
const path = require('path');

async function connectWhatsapp() {
    const auth = await useMultiFileAuthState("session");
    const socket = makeWASocket({
        printQRInTerminal: true,
        browser: ["DAPABOT", "Chrome", "1.0.0"],
        auth: auth.state,
        logger: pino({ level: "silent" }),
        syncFullHistory: false,
    });

    socket.ev.on("creds.update", auth.saveCreds);

    socket.ev.on("connection.update", async ({ connection }) => {
        if (connection === "open") {
            console.log("BOT WHATSAPP SUDAH SIAP!");
        } else if (connection === "close") {
            console.log("Koneksi tertutup, mencoba reconnect..."); // Tambah log untuk debug
            await connectWhatsapp();
        }
    });

    socket.ev.on("messages.upsert", async ({ messages }) => {
        try {
            const chat = messages[0];
            const body = (chat.message?.extendedTextMessage?.text ?? chat.message?.ephemeralMessage?.message?.extendedTextMessage?.text ?? chat.message?.conversation) || "";
            const lowerBody = body.toLowerCase();

            const prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi)[0] : "";
            const commandText = prefix ? lowerBody.slice(prefix.length).split(" ")[0] : lowerBody.split(" ")[0];
            const args = lowerBody.slice(prefix.length + commandText.length).trim();

            switch (commandText) {
                case "ping":
                    await socket.sendMessage(chat.key.remoteJid, { text: "Hello World." }, { quoted: chat });
                    await socket.sendMessage(chat.key.remoteJid, { text: "Hello World2." }, { quoted: chat });
                    break;

                case "fetch":
                case "get": {
                    if (!args) {
                        await socket.sendMessage(chat.key.remoteJid, { text: "Awali dengan http:// atau https://" }, { quoted: chat });
                        return;
                    }
                    try {
                        const res = await axios.get(args);
                        const contentType = res.headers['content-type'];
                        const responseText = /text|json|html|plain/.test(contentType) ? util.format(res.data) : args;
                        await socket.sendMessage(chat.key.remoteJid, { text: responseText }, { quoted: chat });
                    } catch (e) {
                        await socket.sendMessage(chat.key.remoteJid, { text: `Error: ${String(e)}` }, { quoted: chat });
                    }
                    break;
                }
case "assalamualaikum":
case "asalamualaikum":
case "asalamuallaikum":
case "assalamuallaikum":
case "asalamuallaikum": {
    // Handler react
    await socket.sendMessage(chat.key.remoteJid, { react: { text: "👋", key: chat.key } });
    
    // Delay 10ms (menggunakan setTimeout sebagai pengganti sleep)
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Kirim pesan balasan
    const senderNumber = chat.key.participant || chat.key.remoteJid.split('@')[0];
    await socket.sendMessage(chat.key.remoteJid, { 
        text: `\`Waalaikumussalam\` *@${senderNumber}*` 
    }, { quoted: chat });
    break;
}
                case "brat": {
                    if (!args) {
                        await socket.sendMessage(chat.key.remoteJid, { text: "❌ Masukkan teks untuk stiker brat!" }, { quoted: chat });
                        return;
                    }
                    await socket.sendMessage(chat.key.remoteJid, { text: "⏳ Membuat stiker brat..." }, { quoted: chat });
                    try {
                        const bratUrl = `https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(args)}`;
                        const res = await axios.get(bratUrl, { responseType: 'arraybuffer' }); // Ambil gambar sebagai buffer
                        const bratImage = Buffer.from(res.data);

                        const stickerOption = {
                            pack: "Brat Sticker",
                            author: "fastbyte dk :v",
                            type: StickerTypes.FULL,
                            quality: 100
                        };
                        const generateSticker = await createSticker(bratImage, stickerOption);
                        await socket.sendMessage(chat.key.remoteJid, { sticker: generateSticker }, { quoted: chat });
                    } catch (err) {
                        console.error("Error brat sticker:", err);
                        await socket.sendMessage(chat.key.remoteJid, { text: "❌ Gagal membuat stiker brat!" }, { quoted: chat });
                    }
                    break;
                }

                case "ssweb": {
                    if (!args) {
                        await socket.sendMessage(chat.key.remoteJid, { text: "❌ Masukkan URL website!" }, { quoted: chat });
                        return;
                    }
                    const domain = args.replace(/https?:\/\//, "");
                    const ssUrl = `https://image.thum.io/get/width/1900/crop/1000/fullpage/https://${domain}`;
                    await socket.sendMessage(chat.key.remoteJid, {
                        image: { url: ssUrl },
                        caption: `📸 Screenshot dari: *${domain}*`
                    }, { quoted: chat });
                    break;
                }

                case "scweb": {
                    if (!args) {
                        await socket.sendMessage(chat.key.remoteJid, { text: "❌ Masukkan URL website!" }, { quoted: chat });
                        return;
                    }
                    const url = args.startsWith("http") ? args : `https://${args}`;
                    try {
                        const response = await axios.get(url);
                        const filePath = "SourceCode-Fastbyte.html";
                        fs.writeFileSync(filePath, response.data);
                        await socket.sendMessage(chat.key.remoteJid, {
                            document: { url: filePath },
                            fileName: filePath,
                            mimetype: "text/html"
                        }, { quoted: chat });
                    } catch (err) {
                        await socket.sendMessage(chat.key.remoteJid, { text: "❌ Gagal mengambil source code!" }, { quoted: chat });
                        console.error(err);
                    }
                    break;
                }

                case "fbdl":
                case "fb":
                case "facebook": {
                    if (!args) {
                        await socket.sendMessage(chat.key.remoteJid, { text: "<!> Urlnya Mana?" }, { quoted: chat });
                        return;
                    }
                    await socket.sendMessage(chat.key.remoteJid, { text: "<!> Sedang Mengunduh" }, { quoted: chat });
                    try {
                        const anu = `https://vapis.my.id/api/fbdl?url=${encodeURIComponent(args)}`;
                        const res = await axios.get(anu);
                        const response = res.data;
                        await socket.sendMessage(chat.key.remoteJid, {
                            video: { url: response.data.hd_url },
                            mimetype: "video/mp4",
                            caption: `*_Title:_* ${response.data.title}\n*_Durasi:_* ${response.data.durasi}`
                        }, { quoted: chat });
                    } catch (err) {
                        console.error("Error fbdl:", err);
                        await socket.sendMessage(chat.key.remoteJid, { text: "<!> Error, Endpoint Sedang Sibuk" }, { quoted: chat });
                    }
                    break;
                }

                case "tiktok":
                case "tt": {
                    if (!args) {
                        await socket.sendMessage(chat.key.remoteJid, { text: "<!> Urlnya?" }, { quoted: chat });
                        return;
                    }
                    await socket.sendMessage(chat.key.remoteJid, { text: "<!> Sedang Mengunduh" }, { quoted: chat });
                    try {
                        const res = await axios.get(`https://api.diioffc.web.id/api/download/tiktok?url=${args}`);
                        const response = res.data;
                        if (response.result.images) {
                            for (let i of response.result.images) {
                                await socket.sendMessage(chat.key.remoteJid, { image: { url: i } }, { quoted: chat });
                            }
                        } else {
                            await socket.sendMessage(chat.key.remoteJid, {
                                video: { url: response.result.play },
                                mimetype: "video/mp4",
                                caption: response.result.title
                            }, { quoted: chat });
                            setTimeout(async () => {
                                await socket.sendMessage(chat.key.remoteJid, {
                                    audio: { url: response.result.music_info.play },
                                    mimetype: "audio/mpeg",
                                    contextInfo: {
                                        externalAdReply: {
                                            thumbnailUrl: response.result.music_info.cover,
                                            title: response.result.music_info.title,
                                            body: response.result.music_info.author,
                                            sourceUrl: null,
                                            renderLargerThumbnail: true,
                                            mediaType: 1
                                        }
                                    }
                                }, { quoted: chat });
                            }, 3000);
                        }
                    } catch (err) {
                        console.error("Error tiktok:", err);
                        await socket.sendMessage(chat.key.remoteJid, { text: "<!> Error, Endpoint Sedang Sibuk" }, { quoted: chat });
                    }
                    break;
                }

                case "instagram":
                case "igdl":
                case "ig": {
                    if (!args) {
                        await socket.sendMessage(chat.key.remoteJid, { text: "<!> Urlnya?" }, { quoted: chat });
                        return;
                    }
                    await socket.sendMessage(chat.key.remoteJid, { text: "<!> Sedang Mengunduh" }, { quoted: chat });
                    try {
                        const res = await axios.get(`https://api.diioffc.web.id/api/download/instagram?url=${args}`);
                        const response = res.data;
                        const url = response.result[0].url;
                        if (url.includes("jpg")) {
                            if (chat.key.remoteJid.includes("@g.us")) {
                                for (let k of response.result) {
                                    await socket.sendMessage(chat.key.participant || chat.key.remoteJid, { image: { url: k.url } }, { quoted: chat });
                                }
                                await socket.sendMessage(chat.key.remoteJid, { text: "All photos have been sent to your private chat" }, { quoted: chat });
                            } else {
                                for (let k of response.result) {
                                    await socket.sendMessage(chat.key.remoteJid, { image: { url: k.url } }, { quoted: chat });
                                }
                            }
                        } else {
                            await socket.sendMessage(chat.key.remoteJid, {
                                video: { url: response.result[0].url },
                                caption: "<!> Sukses"
                            }, { quoted: chat });
                        }
                    } catch (err) {
                        console.error("Error instagram:", err);
                        await socket.sendMessage(chat.key.remoteJid, { text: "<!> Error, Endpoint Sedang Sibuk" }, { quoted: chat });
                    }
                    break;
                }
                    
                case "sticker":
                case "s":
                    if (chat.message?.imageMessage?.caption === `${prefix}sticker` && chat.message?.imageMessage) {
                        const getMedia = async (msg) => {
                            const messageType = Object.keys(msg?.message)[0];
                            const stream = await downloadContentFromMessage(msg.message[messageType], messageType.replace('Message', ''));
                            let buffer = Buffer.from([]);
                            for await (const chunk of stream) {
                                buffer = Buffer.concat([buffer, chunk]);
                            }
                            return buffer;
                        };

                        try {
                            const mediaData = await getMedia(chat);
                            const stickerOption = {
                                pack: "Fastbyte",
                                author: "fastbyte dk :v",
                                type: StickerTypes.FULL,
                                quality: 100
                            };
                            const generateSticker = await createSticker(mediaData, stickerOption);
                            await socket.sendMessage(chat.key.remoteJid, { sticker: generateSticker }, { quoted: chat });
                        } catch (err) {
                            console.error("Error sticker:", err);
                            await socket.sendMessage(chat.key.remoteJid, { text: "❌ Gagal membuat sticker!" }, { quoted: chat });
                        }
                    }
                    break;
            }
        } catch (err) {
            console.error("Error di messages.upsert:", err);
        }
    });

    return socket;
}

module.exports = { connectWhatsapp };