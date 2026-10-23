import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Route: AI Pedagogical Hint for 6th Grade Math
app.post('/api/gemini/hint', async (req, res) => {
  try {
    const { zoneName, questionText, studentAttempt, options } = req.body;

    if (!ai) {
      return res.json({
        hint: `Petunjuk Guru: Perhatikan hubungan kedua nilai. Pada ${zoneName}, coba buat perbandingan atau sederhanakan dengan membagi kedua bilangan dengan angka yang sama!`,
        source: 'fallback',
      });
    }

    const prompt = `Anda adalah "Guru Pembimbing AI" (bernama Kak Rasio) untuk siswa Kelas 6 Sekolah Dasar di Indonesia (Kurikulum Merdeka).
Materi: Bab Rasio dan Proporsi.
Zona Permainan: ${zoneName || 'Petualangan Rasio'}
Pertanyaan Soal: "${questionText}"
Percobaan/Jawaban Siswa Saat Ini: "${studentAttempt || 'Belum yakin'}"
Pilihan Jawaban (jika ada): ${options ? JSON.stringify(options) : 'Input teks/angka'}

Tugas:
Berikan 1 atau 2 kalimat petunjuk singkat, ramah, membangkitkan rasa ingin tahu, dan mendidik dengan pendekatan Pembelajaran Mendalam (Deep Learning).
PENTING:
- JANGAN langsung memberi jawaban akhir atau angka kuncinya!
- Gunakan bahasa Indonesia yang ceria, hangat, dan mudah dipahami anak usia 11-12 tahun.
- Ajak siswa memikirkan langkah awal (misal: "Ingat urutan siapa yang disebut duluan...", "Coba cari FPB dari...", atau "Bagi harga dengan jumlah barang untuk menemukan 1 buah...").`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    const hintText = response.text || 'Coba baca kembali soal dengan cermat dan perhatikan perbandingannya!';
    return res.json({ hint: hintText.trim(), source: 'gemini' });
  } catch (error: any) {
    console.error('Error generating hint:', error?.message);
    return res.json({
      hint: 'Petunjuk: Perhatikan bilangan mana yang dibandingkan terlebih dahulu. Gunakan operasi perkalian atau pembagian yang sesuai!',
      source: 'fallback',
    });
  }
});

// Route: AI Student Reflection Feedback
app.post('/api/gemini/reflect', async (req, res) => {
  try {
    const { zoneName, answers } = req.body;

    if (!ai) {
      return res.json({
        feedback:
          'Refleksi yang sangat bagus! Kamu sudah menunjukkan pemahaman mendalam tentang konsep rasio dan strategi berpikir kritis.',
        source: 'fallback',
      });
    }

    const prompt = `Anda adalah Guru Matematika SD Kelas 6 yang mengapresiasi refleksi belajar siswa (Deep Learning: Berkesadaran, Bermakna, Menggembirakan).
Siswa baru saja menyelesaikan Zona: ${zoneName}.
Berikut adalah jawaban refleksi siswa:
1. Konsep yang dipelajari: ${answers?.concept || '-'}
2. Strategi yang digunakan: ${answers?.strategy || '-'}
3. Cara memeriksa jawaban: ${answers?.check || '-'}
4. Bagian paling menantang: ${answers?.challenge || '-'}
5. Penerapan sehari-hari: ${answers?.realWorld || '-'}

Tugas:
Tuliskan catatan apresiasi guru (maksimal 3 kalimat) yang memotivasi siswa, mengakui cara berpikirnya, dan menegaskan makna belajar rasio dalam kehidupan nyata.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    return res.json({
      feedback: response.text?.trim() || 'Hebat sekali! Refleksimu menunjukkan pemikiran yang cermat dan strategi yang tepat.',
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Error in reflection feedback:', error?.message);
    return res.json({
      feedback:
        'Bagus sekali refleksimu! Kamu terus bertumbuh dalam memahami konsep rasio dan menerapkannya dalam kehidupan sehari-hari.',
      source: 'fallback',
    });
  }
});

// Set up Vite development server
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ratioverse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
