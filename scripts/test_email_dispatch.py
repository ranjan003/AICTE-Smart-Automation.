import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_deficiency_email(sender='salemranjan@gmail.com',
                          recipient='rolexleo345678@gmail.com',
                          password='ynwxdcsbcwgpnzjd'):
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'URGENT AICTE Notice: Document Deficiency & 7-Day Rectification [App: AICTE-2026-9024]'
    msg['From'] = f'AICTE Approval Scrutiny Bureau <{sender}>'
    msg['To'] = recipient

    html = """
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
      <div style="background-color: #0f2c59; padding: 20px; color: white; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 18px;">ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)</h2>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #f59e0b;">Approval Bureau &bull; Ministry of Education, Govt. of India</p>
      </div>
      <div style="border: 1px solid #cbd5e1; border-top: none; padding: 24px; border-radius: 0 0 8px 8px; background-color: #ffffff;">
        <p>Dear College Administrator (Greenfield Institute of Technology / Ref ID: <strong>AICTE-2026-9024</strong>),</p>
        <p>During the automated scrutiny and verification of your technical campus approval application, critical document deficiencies were identified:</p>
        
        <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 14px; margin: 18px 0; border-radius: 4px;">
          <strong style="color: #9f1239; font-size: 14px;">FLAGGED DOCUMENT DEFICIENCY:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #881337;">
            <li><strong>Document Category:</strong> Fire Safety Certificate & NOC</li>
            <li><strong>Deficiency Reason:</strong> The uploaded certificate expired on 24-Oct-2026. Invalid under AICTE Approval Process Handbook (APH 2026-27).</li>
            <li><strong>Required Correction:</strong> Obtain an updated endorsement/renewal NOC from the Competent Municipal Fire Brigade and upload the PDF to the portal.</li>
            <li><strong>Statutory Correction Deadline:</strong> <strong>7 Days (Deadline: 02-Nov-2026, 23:59 IST)</strong></li>
          </ul>
        </div>

        <div style="background-color: #fefce8; border: 1px solid #fef08a; padding: 12px; border-radius: 6px; margin: 15px 0; font-size: 13px; color: #854d0e;">
          <strong>Automatic Reminder & Escalation Notice:</strong><br>
          If your institution does not upload the rectified certificate before the 7-day statutory deadline, this dossier will automatically escalate to <strong>Tier-2 Bureau Officer Escalation</strong> and may lead to rejection of course intake approval.
        </div>

        <p style="margin-top: 25px; font-size: 13px; color: #64748b;">
          This is an automated notification dispatched by the AICTE Scrutiny Workflow Automation Engine.<br>
          Authorized Official: <em>Dr. R. Ramanathan (Senior Scrutiny Committee Officer)</em>
        </p>
      </div>
    </body>
    </html>
    """

    msg.attach(MIMEText(html, 'html'))

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender, password)
            server.sendmail(sender, recipient, msg.as_string())
        print("SUCCESS: Deficiency email dispatched successfully to", recipient)
        return True
    except Exception as e:
        print("ERROR:", e)
        return False

if __name__ == '__main__':
    send_deficiency_email()
