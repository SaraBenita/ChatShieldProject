# שלב 1: תמונת בסיס עם Node.js + Chromium
FROM zenika/alpine-chrome:with-node

# שלב 2: התקנת רכיבי GUI + VNC + noVNC + openbox
USER root
RUN apk update && apk add --no-cache \
    openbox \
    x11vnc \
    xvfb \
    dbus \
    curl \
    git \
    ttf-freefont \
    supervisor \
    bash

# שלב 3: התקנת noVNC
RUN mkdir -p /opt/novnc && \
    git clone https://github.com/novnc/noVNC.git /opt/novnc && \
    git clone https://github.com/novnc/websockify /opt/novnc/utils/websockify

# שלב 4: יצירת תיקיות נדרשות
RUN mkdir -p /app/extensionCode /root/.config/openbox /var/log/supervisor
WORKDIR /app

# שלב 5: העתקת קוד התוסף
COPY extensionCode /app/extensionCode

# שלב 6: העתקת קובץ openbox (אם יש לך אחד)
COPY whatsapp-container/openbox/rc.xml /root/.config/openbox/rc.xml

# שלב 7: העתקת קובץ supervisord
COPY whatsapp-container/supervisord.conf /etc/supervisord.conf

# שלב 8: יצירת volume לשמירת session (של WhatsApp)
VOLUME ["/app/chrome-profile"]

# שלב 9: פתיחת פורטים – VNC רגיל ו־noVNC
EXPOSE 5900 6080

RUN mkdir -p /app/chrome-profile && chmod -R 777 /app/chrome-profile

# שלב 10: הפעלת כל המערכת
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
