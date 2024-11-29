import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY is not set. Email notifications will not be sent.');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('Email would have been sent:', { to, subject, text });
    return;
  }

  try {
    await sgMail.send({
      to,
      from: FROM_EMAIL,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export const emailTemplates = {
  accessRequest: (
    adminEmail: string,
    requesterName: string,
    documentTitle: string,
    requestedRole: string
  ) => ({
    subject: `Access Request: ${requesterName} wants ${requestedRole} access to "${documentTitle}"`,
    text: `
      ${requesterName} has requested ${requestedRole} access to the document "${documentTitle}".
      
      You can manage document access by opening the document and clicking on the "Manage Access" button.
    `,
    html: `
      <h2>Document Access Request</h2>
      <p><strong>${requesterName}</strong> has requested <strong>${requestedRole}</strong> access to the document "<strong>${documentTitle}</strong>".</p>
      <p>You can manage document access by opening the document and clicking on the "Manage Access" button.</p>
    `,
  }),

  accessGranted: (
    userEmail: string,
    documentTitle: string,
    role: string,
    expiresAt?: Date
  ) => ({
    subject: `Access Granted: You now have ${role} access to "${documentTitle}"`,
    text: `
      You have been granted ${role} access to the document "${documentTitle}".
      ${expiresAt ? `\nThis access will expire on ${expiresAt.toLocaleString()}.` : ''}
      
      You can access the document by clicking on the link in the email.
    `,
    html: `
      <h2>Document Access Granted</h2>
      <p>You have been granted <strong>${role}</strong> access to the document "<strong>${documentTitle}</strong>".</p>
      ${expiresAt ? `<p>This access will expire on <strong>${expiresAt.toLocaleString()}</strong>.</p>` : ''}
      <p>You can access the document by clicking on the link in the email.</p>
    `,
  }),

  accessRevoked: (
    userEmail: string,
    documentTitle: string,
    reason: string
  ) => ({
    subject: `Access Revoked: "${documentTitle}"`,
    text: `
      Your access to the document "${documentTitle}" has been revoked.
      Reason: ${reason}
      
      If you believe this is a mistake, please contact the document owner.
    `,
    html: `
      <h2>Document Access Revoked</h2>
      <p>Your access to the document "<strong>${documentTitle}</strong>" has been revoked.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>If you believe this is a mistake, please contact the document owner.</p>
    `,
  }),

  temporaryLinkCreated: (
    userEmail: string,
    documentTitle: string,
    role: string,
    url: string,
    expiresAt: Date,
    maxUses?: number
  ) => ({
    subject: `Temporary Access Link: "${documentTitle}"`,
    text: `
      A temporary access link has been created for the document "${documentTitle}".
      
      Role: ${role}
      Expires: ${expiresAt.toLocaleString()}
      ${maxUses ? `Maximum uses: ${maxUses}` : 'Unlimited uses'}
      
      Access link: ${url}
      
      Please note that this link should not be shared publicly.
    `,
    html: `
      <h2>Temporary Access Link Created</h2>
      <p>A temporary access link has been created for the document "<strong>${documentTitle}</strong>".</p>
      <ul>
        <li><strong>Role:</strong> ${role}</li>
        <li><strong>Expires:</strong> ${expiresAt.toLocaleString()}</li>
        ${maxUses ? `<li><strong>Maximum uses:</strong> ${maxUses}</li>` : '<li>Unlimited uses</li>'}
      </ul>
      <p><a href="${url}">Click here to access the document</a></p>
      <p><small>Please note that this link should not be shared publicly.</small></p>
    `,
  }),
}; 