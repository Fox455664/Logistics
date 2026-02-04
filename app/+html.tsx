import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * هذا الملف مسؤول عن إعدادات صفحة الويب (HTML)
 * هنا نحدد العنوان واللغة لضمان ظهور التطبيق بشكل احترافي
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* عنوان الصفحة الذي يظهر في المتصفح */}
        <title>شحناتي | إدارة النقل اللوجستي</title>
        
        {/* إعدادات الأيقونات واللون الرئيسي للهاتف */}
        <meta name="theme-color" content="#0F172A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <ScrollViewStyleReset />
        
        {/* إصلاح مشكلة الخطوط والأيقونات */}
        <style dangerouslySetInnerHTML={{ __html: `
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #F8FAFC;
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
