const { connectWhatsapp } = require('./fastbyte');

(async () => {
    try {
        await connectWhatsapp();
    } catch (error) {
        console.error("Gagal memulai bot:", error);
    }
})();