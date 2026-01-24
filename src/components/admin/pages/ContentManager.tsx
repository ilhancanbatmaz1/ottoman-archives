

const ContentManager = () => {
    return (
        <div className="p-10 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">CMS Test Ekranı</h1>
            <p className="text-gray-600 mb-6">
                Eğer bu yazıyı görüyorsanız sayfa başarıyla yüklenmiş demektir.
            </p>
            <div className="p-4 bg-green-100 text-green-800 rounded-lg inline-block">
                Sistem Çalışıyor ✅ (Default Export)
            </div>
            <div className="mt-8">
                <p className="text-sm text-gray-500">Lütfen geliştiriciye bu ekranı gördüğünüzü söyleyin.</p>
            </div>
        </div>
    );
};

export default ContentManager;
