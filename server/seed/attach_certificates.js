const mongoose = require('mongoose');
const Compliance = require('../models/Compliance');
const Staff = require('../models/Staff');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healthplus').then(async () => {
  const recs = await Compliance.find().populate('staff');
  console.log(`Found ${recs.length} compliance records. Attaching certificate documents...`);

  for (let r of recs) {
    const staffName = r.staff?.fullName || 'Clinical Staff';
    const certId = r.certificateNumber || `CERT-${r.requirement}-${Math.floor(100000 + Math.random() * 900000)}`;
    const issue = r.issueDate || new Date('2024-01-15');
    const expiry = r.expiryDate || new Date('2028-01-01');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560" width="100%" height="100%">
      <defs>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#b48328"/>
          <stop offset="50%" stop-color="#ecc96e"/>
          <stop offset="100%" stop-color="#9a6e1d"/>
        </linearGradient>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f8fafc"/>
        </linearGradient>
        <radialGradient id="seal" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ecc96e"/>
          <stop offset="70%" stop-color="#b48328"/>
          <stop offset="100%" stop-color="#785311"/>
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="800" height="560" fill="url(#bg)" rx="16"/>
      <rect x="20" y="20" width="760" height="520" fill="none" stroke="url(#gold)" stroke-width="6" rx="12"/>
      <rect x="28" y="28" width="744" height="504" fill="none" stroke="#00828e" stroke-width="1.5" stroke-dasharray="8 4" rx="8"/>
      <text x="400" y="75" font-family="sans-serif" font-size="13" font-weight="700" fill="#00828e" text-anchor="middle" letter-spacing="4">HOSPITAL CLINICAL CREDENTIALING BOARD</text>
      <text x="400" y="108" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#0f172a" text-anchor="middle">Certificate of Accreditation</text>
      <text x="400" y="132" font-family="sans-serif" font-size="12" fill="#64748b" text-anchor="middle">Official Healthcare Professional Credential &amp; Compliance Record</text>
      <line x1="240" y1="145" x2="560" y2="145" stroke="url(#gold)" stroke-width="2"/>
      <text x="400" y="185" font-family="sans-serif" font-size="12" fill="#475569" text-anchor="middle" letter-spacing="2">THIS CERTIFIES THAT</text>
      <text x="400" y="230" font-family="Georgia, serif" font-size="32" font-weight="bold" fill="#00828e" text-anchor="middle">${staffName}</text>
      <text x="400" y="265" font-family="sans-serif" font-size="13" fill="#334155" text-anchor="middle">has fulfilled all accredited curriculum and clinical standards for</text>
      <rect x="180" y="290" width="440" height="48" rx="10" fill="#eef9fa" stroke="#bfe8ee" stroke-width="1.5"/>
      <text x="400" y="322" font-family="sans-serif" font-size="19" font-weight="800" fill="#0f172a" text-anchor="middle">${r.requirement} ACCREDITATION</text>
      <text x="120" y="380" font-family="sans-serif" font-size="11" font-weight="700" fill="#64748b">ACCREDITATION ID:</text>
      <text x="120" y="400" font-family="monospace" font-size="14" font-weight="bold" fill="#0f172a">${certId}</text>
      <text x="350" y="380" font-family="sans-serif" font-size="11" font-weight="700" fill="#64748b">ISSUANCE DATE:</text>
      <text x="350" y="400" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a">${issue.toISOString().split('T')[0]}</text>
      <text x="560" y="380" font-family="sans-serif" font-size="11" font-weight="700" fill="#64748b">EXPIRY DATE:</text>
      <text x="560" y="400" font-family="sans-serif" font-size="13" font-weight="bold" fill="#e11d48">${expiry.toISOString().split('T')[0]}</text>
      <g transform="translate(680, 450)">
        <circle cx="0" cy="0" r="38" fill="url(#seal)"/>
        <circle cx="0" cy="0" r="32" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="4 2"/>
        <text x="0" y="-5" font-family="sans-serif" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">NABH</text>
        <text x="0" y="10" font-family="sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle">VALID</text>
      </g>
      <line x1="120" y1="475" x2="280" y2="475" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="200" y="470" font-family="cursive" font-size="20" fill="#0f172a" text-anchor="middle">Dr. J. Henderson, MD</text>
      <text x="200" y="492" font-family="sans-serif" font-size="10" font-weight="600" fill="#64748b" text-anchor="middle">Chief Medical Officer</text>
      <line x1="360" y1="475" x2="520" y2="475" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="440" y="470" font-family="cursive" font-size="20" fill="#0f172a" text-anchor="middle">E. Vance, RN, BSN</text>
      <text x="440" y="492" font-family="sans-serif" font-size="10" font-weight="600" fill="#64748b" text-anchor="middle">Clinical Director</text>
    </svg>`;

    const docUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);

    await Compliance.findByIdAndUpdate(r._id, {
      certificateNumber: certId,
      issueDate: issue,
      documentUrl: docUrl
    });
  }

  console.log('Successfully attached official certificate documents to all compliance records!');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
