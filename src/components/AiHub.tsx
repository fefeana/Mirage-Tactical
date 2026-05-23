import React, { useRef, useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { AIRouterAndTranslator } from '../api/ai';

export default function AiHub() {
  const [videoUrl, setVideoUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [translationResult, setTranslationResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTranslate = async () => {
    if (!videoUrl) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      // Simulate external API call as per AI engine logic
      const result = await AIRouterAndTranslator(
        videoUrl, 
        "ar", 
        { isSubscribed: true },
        (pct) => setProgress(pct)
      );
      if (result.status === "success") {
        setTranslationResult(result);
        setPreviewUrl(result.previewUrl ||
          "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" // Placeholder if no real URL returned
        );
        if (videoRef.current) {
          videoRef.current.src = result.previewUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
          videoRef.current.play();
        }
      } else {
        alert(result.message || "يتطلب اشتراكًا للمحتوى الطويل");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (translationResult?.actions?.download) {
      translationResult.actions.download();
    } else if (previewUrl) {
      console.log("Downloading file from: " + previewUrl);
      window.open(previewUrl, '_blank');
    }
  };

  const handleShare = () => {
    if (translationResult?.actions?.share) {
      translationResult.actions.share();
    } else {
      console.log("Sharing link...");
      if (navigator.share && previewUrl) {
        navigator.share({
          title: 'UFO AlBarq Translated Video',
          url: previewUrl
        }).catch(console.error);
      }
    }
  };

  return (
    <div className="font-sans text-right" dir="rtl">
      {/* Main Container Title */}
      <h2 className="text-center text-white text-[24px] mb-[40px] tracking-[1px] font-semibold">بوابة الذكاء الاصطناعي</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[25px]">
        
        {/* Section 1: Professional Image Generation */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[16px] p-[25px] flex flex-col transition-all duration-300 hover:border-purple-500/30 group">
          <div className="text-[28px] mb-[15px]">🎨</div>
          <h3 className="text-white text-[18px] m-0 mb-[10px] font-medium">توليد صور احترافية</h3>
          <p className="text-[#b3b3b3] text-[14px] leading-[1.6] m-0 mb-[20px] grow">
            حوّل أفكارك إلى تصاميم فائقة الدقة بنقرة واحدة.
          </p>
          <input 
            type="text" 
            placeholder="اكتب ما تتخيله هنا..." 
            className="w-full p-[12px] bg-white/[0.04] border border-white/[0.08] rounded-[8px] text-white text-[14px] outline-none mb-[15px] box-border focus:border-white/30" 
          />
          <button className="w-full p-[12px] bg-white text-black border-none rounded-[8px] font-semibold cursor-pointer hover:opacity-90 transition-opacity">
            توليد الصورة
          </button>
        </div>

        {/* Section 2: Customer Reviews */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[16px] p-[25px] flex flex-col transition-all duration-300 hover:border-yellow-500/30 group">
          <div className="text-[28px] mb-[15px]">⭐</div>
          <h3 className="text-white text-[18px] m-0 mb-[10px] font-medium">آراء العملاء</h3>
          <p className="text-[#b3b3b3] text-[14px] leading-[1.6] m-0 mb-[20px] grow">
            شاهد تجارب مجتمعنا مع خدماتنا.
          </p>
          <div className="bg-black rounded-[10px] overflow-hidden mb-[15px] aspect-video relative">
            <video 
              src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
              controls 
              className="w-full h-full object-cover"
            ></video>
          </div>
        </div>

        {/* Section 3: AI Video Translation */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[16px] p-[25px] flex flex-col transition-all duration-300 hover:border-emerald-500/30 group">
          <div className="text-[28px] mb-[15px]">🌐</div>
          <h3 className="text-white text-[18px] m-0 mb-[10px] font-medium">الترجمة الفورية</h3>
          <p className="text-[#b3b3b3] text-[14px] leading-[1.6] m-0 mb-[20px] grow">
            ترجمة فورية للمسلسلات والأفلام الطويلة والقصيرة.
          </p>
          
          <input 
            type="text" 
            placeholder="ضع رابط الفيديو أو المسلسل هنا..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full p-[12px] bg-white/[0.04] border border-white/[0.08] rounded-[8px] text-white text-[14px] outline-none mb-[15px] box-border focus:border-white/30" 
          />
          
          <div className="bg-black rounded-[10px] overflow-hidden mb-[15px] aspect-video relative flex items-center justify-center">
            <video 
              ref={videoRef}
              id="aiVideoPreview" 
              controls 
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
            ></video>

            {/* غطاء التحميل الذكي مع شريط التقدم */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity">
                <div className="w-[80%] text-center text-white text-[14px]">
                  <div className="w-[24px] h-[24px] border-2 border-white/10 border-t-emerald-500 rounded-full mx-auto mb-[10px] animate-spin"></div>
                  <span>جاري معالجة الفيديو... {progress}%</span>
                  <div className="w-full h-[6px] bg-white/10 rounded-[10px] mt-[12px] overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] rounded-[10px] transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-[10px]">
            <button 
                onClick={handleTranslate}
                disabled={isProcessing}
                className="grow p-[12px] bg-white text-black border-none rounded-[8px] font-semibold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50">
              {isProcessing ? 'جاري الترجمة...' : 'بدء الترجمة'}
            </button>
            <button onClick={handleDownload} title="تنزيل" className="bg-white/[0.04] border border-white/[0.08] text-white rounded-[8px] w-[45px] h-[45px] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
              <Download size={18} />
            </button>
            <button onClick={handleShare} title="مشاركة" className="bg-white/[0.04] border border-white/[0.08] text-white rounded-[8px] w-[45px] h-[45px] flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
              <Share2 size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
