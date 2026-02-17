import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import * as XLSX from 'xlsx';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ownerId, email } = req.body;
  if (!ownerId || !email) {
    return res.status(400).json({ error: 'Missing ownerId or email' });
  }

  try {
    // Fetch all data for owner
    const customers = await db.customers.where('ownerId').equals(ownerId).toArray();
    const sales = await db.sales.where('ownerId').equals(ownerId).toArray();
    const payments = await db.payments.where('ownerId').equals(ownerId).toArray();
    const villages = await db.villages.where('ownerId').equals(ownerId).toArray();
    const agents = await db.agents.where('ownerId').equals(ownerId).toArray();
    const products = await db.products.where('ownerId').equals(ownerId).toArray();

    // Create Excel workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(customers), 'Customers');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sales), 'Sales');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(payments), 'Payments');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(villages), 'Villages');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(agents), 'Agents');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(products), 'Products');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Send email (configure your SMTP)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Enterprise EMI" <backup@enterprise.com>',
      to: email,
      subject: 'Enterprise EMI Backup',
      text: 'Your data backup is attached.',
      attachments: [
        {
          filename: `backup_${new Date().toISOString().slice(0,10)}.xlsx`,
          content: buffer,
        },
      ],
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Backup failed' });
  }
}