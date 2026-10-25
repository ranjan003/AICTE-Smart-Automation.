import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_reminder_email(sender='salemranjan@gmail.com',
                        recipient='rolexleo345678@gmail.com',
                        password='ynwxdcsbcwgpnzjd',
                        application_id='AICTE-2026-9024',
                        is_overdue=False):
    msg = MIMEMultipart('alternative')
    
    if is_overdue:
        msg['Subject'] = f'FINAL NOTICE & ESCALATION: Statutory Deficiency Deadline Lapsed [Ref: {application_id}]'
    else:
        msg['Subject'] = f'DEADLINE REMINDER: 48 Hours Remaining for Deficiency Rectification [Ref: {application_id}]'
        
    msg['From'] = f'AICTE Approval Scrutiny Bureau <{sender}>'
    msg['To'] = recipient

    headline = "OVERDUE ESCALATION NOTICE - TIER 2" if is_overdue else "URGENT COMPLIANCE DEADLINE REMINDER"
    banner_color = "#991b1b" if is_overdue else "#c2410c"
    
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
      <div style="background-color: #0f2c59; padding: 20px; color: white; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 18px;">ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)</h2>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #f59e0b;">Compliance &amp; Alert Management Bureau &bull; Govt. of India</p>
      </div>
      <div style="border: 1px solid #cbd5e1; border-top: none; padding: 24px; border-radius: 0 0 8px 8px; background-color: #ffffff;">
        <div style="background-color: {'#fef2f2' if is_overdue else '#fff7ed'}; border-left: 4px solid {banner_color}; padding: 14px; margin-bottom: 20px; border-radius: 4px;">
          <strong style="color: {banner_color}; font-size: 14px;">{headline}</strong>
          <p style="margin: 5px 0 0 0; color: #334155; font-size: 13px;">
            Application Reference: <strong>{application_id}</strong> &bull; Greenfield Institute of Technology
          </p>
        </div>

        <p>Dear College Administrator,</p>
        <p>
          {'Our automated compliance surveillance system indicates that the 7-day statutory rectification window has EXPIRED without receipt of the renewed Fire Safety Certificate.' if is_overdue else 'This is an automated reminder that your 7-day statutory rectification window will close within 48 hours. Rectified Fire Safety Certificate is still pending.'}
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 6px; margin: 15px 0; font-size: 13px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #64748b; width: 180px;">Deficient Document:</td><td><strong>Fire Safety Certificate & NOC</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Deficiency Identified:</td><td style="color: #b91c1c;">Expired Validity (Old NOC expired on 24-Oct-2026)</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Escalation Status:</td><td><strong style="color: {banner_color};">{'Tier-2: Escalated to Regional Director & Bureau Officer' if is_overdue else 'Tier-1: Final Administrative Warning'}</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Action Required:</td><td>Upload renewed NOC via AICTE Institutional Portal immediately.</td></tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #475569;">
          Failure to rectify document deficiencies prior to statutory closure will lead to recommendation of <strong>Zero Intake / Approval Rejection</strong> by the Standing Scrutiny Committee.
        </p>

        <p style="margin-top: 25px; font-size: 13px; color: #64748b;">
          AICTE Automated Workflow &amp; Alert Management Engine<br>
          Authorized Sender: <em>salemranjan@gmail.com</em> &bull; Target Recipient: <em>rolexleo345678@gmail.com</em>
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
        print(f"SUCCESS: {'Overdue escalation' if is_overdue else 'Reminder'} email dispatched to {recipient}")
        return True
    except Exception as e:
        print("ERROR:", e)
        return False

if __name__ == '__main__':
    # Test reminder dispatch
    send_reminder_email(is_overdue=False)
