import React from "react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-950 py-16 px-4 border-t border-brand-900">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        <div className="space-y-6 text-center md:text-left">
          <div className="text-brand-500 text-3xl font-serif italic font-bold">Terre Spa</div>
          <p className="text-brand-400 text-sm italic">"Chạm vào an yên - Đẹp bền từ tự nhiên"</p>

          <div className="pt-4 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-brand-700 mb-1">Địa chỉ</p>
              <p className="text-brand-200 text-sm leading-relaxed">
                Số 2 ngõ 282/33 Đ. Kim Giang, Kim Văn,
                <br /> Định Công, TP. Hà Nội, Việt Nam.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-brand-700 mb-1">Hotline</p>
              <p className="text-brand-200 text-sm">0569087777</p>
            </div>
          </div>

          <div className="pt-8 border-t border-brand-900/50">
            <p className="text-brand-700 text-xs">&copy; {currentYear} Terre Spa. All rights reserved.</p>
          </div>
        </div>

        <div className="h-64 md:h-full min-h-75 w-full bg-brand-900/50 rounded-sm overflow-hidden relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.3937684003854!2d105.8214203!3d20.9768471!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad3f8a928e27%3A0xbc72b41f64bf9636!2zVEVSUkUgU1BBLSBH4buZaSBk4bqndSBkxrDhu6FuZyBzaW5oLCBtYXNzYWdlIHZhaSBnw6F5LCBib2R5LCBDaMSDbSBzw7NjIGRhIG3hu6VuLSBuw6FtIGtow7RuZyB4w6JtIGzhuqVuLCB0cmnhu4d0IGzDtG5nLg!5e0!3m2!1svi!2s!4v1781707829329!5m2!1svi!2s"
            className="absolute inset-0 w-full h-full border-0 z-10"
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Terre Spa Map"
          ></iframe>
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center pointer-events-none text-brand-700 text-sm z-0">
            Bản đồ đang tải...
          </div>
        </div>
      </div>
    </footer>
  );
};
