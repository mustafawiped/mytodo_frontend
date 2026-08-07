# MyToDo!

Next.js ile geliştirilmiş yapılacaklar ve not uygulamasının arayüzü.

## Çalıştırma

```bash
npm install
copy .env.example .env.local
npm run dev
```

## Üretim derlemesi

```bash
npm run build
npm start
```

## Deployment

Frontend sunucusunda `NEXT_PUBLIC_API_URL` değerini yayınlanan API adresinin `/api` yolu ile tanımlayın. Proje standalone Next.js çıktısı üretir.
