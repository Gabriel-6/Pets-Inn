import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from configs.config import Config

def send_email(destinatario, nome, token):
    mensagem = MIMEMultipart()
    mensagem["From"] = Config.EMAIL
    mensagem["To"] = destinatario
    mensagem["Subject"] = "Confirmação de E-mail"

    ip = "localhost"
    texto = f"Olá {nome},\n\nPara confirmar seu e-mail, clique no link abaixo:\nhttp://{ip}:5000/confirmar_email?token={token}\n\nObrigado!"

    mensagem.attach(MIMEText(texto, "plain"))

    try:
        server = smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT)
        server.starttls()
        server.login(Config.EMAIL, Config.PASSWORD)
        server.sendmail(Config.EMAIL, destinatario, mensagem.as_string())
        server.quit()
        print("E-mail enviado com sucesso")
    except Exception as e:
        print(f"Erro ao enviar o Email: {str(e)}")

def send_reset_email(destinatario, reset_link):
    mensagem = MIMEMultipart()
    mensagem["From"] = Config.EMAIL
    mensagem["To"] = destinatario
    mensagem["Subject"] = "Redefinição de Senha"

    body = f"""
    <html>
        <body>
            <h2>Redefinição de Senha</h2>
            <p>Você solicitou a redefinição de senha. Clique no link abaixo para redefinir sua senha:</p>
            <a href="{reset_link}">Redefinir Senha</a>
            <p>Se você não solicitou essa alteração, por favor, ignore este email.</p>
        </body>
    </html>
    """
    mensagem.attach(MIMEText(body, "html"))

    try:
        server = smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT)
        server.starttls()
        server.login(Config.EMAIL, Config.PASSWORD)
        server.sendmail(Config.EMAIL, destinatario, mensagem.as_string())
        server.quit()
        print("Email enviado com sucesso!")
    except Exception as e:
        print(f"Erro ao enviar email: {e}")