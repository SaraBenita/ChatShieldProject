# שלב 1: תמונת בסיס עם Chrome + Node.js
FROM zenika/alpine-chrome:with-node

# שלב 2: עדכון והתקנת רכיבי GUI + VNC + openbox
USER root
RUN apk update && apk add --no-cache \
    openbox \
    x11vnc \
    xvfb \
    dbus \
    curl \
    ttf-freefont \
    supervisor

# שלב 3: יצירת תיקיות נדרשות
RUN mkdir -p /app/extensionCode \
    && mkdir -p /root/.config/openbox

WORKDIR /app

# שלב 4: העתקת קוד התוסף
COPY ./extensionCode /app/extensionCode

# שלב 5: העתקת קובץ openbox rc.xml
COPY ./whatsapp-container/openbox/rc.xml /root/.config/openbox/rc.xml

# שלב 6: העתקת קובץ supervisord.conf
COPY ./whatsapp-container/supervisord.conf /etc/supervisord.conf

# שלב 7: תיקייה לשמירת פרופיל כרום (session של WhatsApp)
VOLUME ["/app/chrome-profile"]

# שלב 8: פתיחת פורט לצפייה ב־VNC
EXPOSE 5900

# שלב 9: הפעלת הסביבה הגרפית
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
