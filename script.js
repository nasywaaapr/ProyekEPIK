document.addEventListener('DOMContentLoaded', () => {
    // Ambil referensi elemen DOM
    const numQuestionsInput = document.getElementById('numQuestions');
    const numStudentsInput = document.getElementById('numStudents');
    const generateInputsBtn = document.getElementById('generateInputs');
    const answerInputSection = document.getElementById('answerInputSection');
    const keyAnswerContainer = document.getElementById('keyAnswerContainer');
    const studentAnswersContainer = document.getElementById('studentAnswersContainer');
    const analyzeAnswersBtn = document.getElementById('analyzeAnswers');
    const analysisResults = document.getElementById('analysisResults');
    const scoreSummary = document.getElementById('scoreSummary');
    const questionCorrectSummary = document.getElementById('questionCorrectSummary');
    const studentRanking = document.getElementById('documentRanking');
    const groupAnalysisDiv = document.getElementById('groupAnalysis');
    const difficultyIndexDiv = document.getElementById('difficultyIndex');
    const discriminatingPowerDiv = document.getElementById('discriminatingPower');
    const validityTestDiv = document.getElementById('validityTest');
    const reliabilityTestDiv = document.getElementById('reliabilityTest'); 

    // Tidak ada preset data lagi di sini, user akan menginput manual
    let numQuestions = 0;
    let numStudents = 0;

    // Fungsi untuk menghasilkan input jawaban (sekarang dipanggil oleh tombol)
    generateInputsBtn.addEventListener('click', () => {
        numQuestions = parseInt(numQuestionsInput.value);
        numStudents = parseInt(numStudentsInput.value);

        if (isNaN(numQuestions) || isNaN(numStudents) || numQuestions <= 0 || numStudents <= 0) {
            alert('Jumlah soal dan jumlah anak harus angka positif!');
            return;
        }

        // Kosongkan dan sembunyikan hasil analisis sebelumnya
        keyAnswerContainer.innerHTML = '';
        studentAnswersContainer.innerHTML = '';
        analysisResults.style.display = 'none';

        // Input kunci jawaban
        for (let i = 0; i < numQuestions; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = '1';
            input.classList.add('key-answer-input');
            input.placeholder = `Q${i + 1}`;
            input.id = `key-Q${i + 1}`;
            keyAnswerContainer.appendChild(input);
        }

        // Input jawaban siswa
        for (let s = 0; s < numStudents; s++) {
            const studentDiv = document.createElement('div');
            studentDiv.classList.add('student-row');
            studentDiv.innerHTML = `<h4>Siswa ${s + 1}:</h4>`;
            const answerRow = document.createElement('div');
            answerRow.classList.add('answer-row');
            for (let q = 0; q < numQuestions; q++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = '1';
                input.classList.add('student-answer-input');
                input.placeholder = `Q${q + 1}`;
                input.id = `student-${s + 1}-Q${q + 1}`;
                answerRow.appendChild(input);
            }
            studentDiv.appendChild(answerRow);
            studentAnswersContainer.appendChild(studentDiv);
        }

        answerInputSection.style.display = 'block'; // Tampilkan bagian input
    });

    // Fungsi untuk analisis jawaban (sekarang dipanggil oleh tombol)
    analyzeAnswersBtn.addEventListener('click', () => {
        const keyAnswers = [];
        document.querySelectorAll('.key-answer-input').forEach(input => {
            keyAnswers.push(input.value.toUpperCase()); // Ubah ke huruf besar untuk konsistensi
        });

        const studentAnswers = [];
        for (let s = 0; s < numStudents; s++) {
            const studentRowAnswers = [];
            for (let q = 0; q < numQuestions; q++) {
                const input = document.getElementById(`student-${s + 1}-Q${q + 1}`);
                studentRowAnswers.push(input.value.toUpperCase());
            }
            studentAnswers.push(studentRowAnswers);
        }

        // Validasi input: Pastikan semua kolom jawaban diisi
        if (keyAnswers.some(ans => ans === '') || studentAnswers.some(row => row.some(ans => ans === ''))) {
            alert('Semua kolom jawaban harus diisi!');
            return;
        }

        // Inisialisasi hasil
        const studentScores = Array(numStudents).fill(0); // Total benar per anak
        const questionCorrectCounts = Array(numQuestions).fill(0); // Total benar per soal
        const processedStudentAnswers = []; // Jawaban siswa dalam bentuk 0 atau 1 (1 jika benar, 0 jika salah)

        // 3. Konversi jawaban menjadi 0 atau 1 & 4. Jumlahkan setiap anak itu benar berapa soal
        // 5. Jumlahkan setiap soal itu ada berapa anak yang jawab benar
        for (let s = 0; s < numStudents; s++) {
            const processedRow = [];
            for (let q = 0; q < numQuestions; q++) {
                if (studentAnswers[s][q] === keyAnswers[q]) {
                    processedRow.push(1);
                    studentScores[s]++;
                    questionCorrectCounts[q]++;
                } else {
                    processedRow.push(0);
                }
            }
            processedStudentAnswers.push(processedRow);
        }

        // --- Tampilkan Ringkasan Skor dan Ranking ---
        displayScoreSummary(studentScores);
        displayQuestionCorrectSummary(questionCorrectCounts);
        displayStudentRanking(studentScores);

        // --- Analisis Kelompok Atas dan Bawah ---
        const sortedStudents = studentScores.map((score, index) => ({ score, originalIndex: index }));
        sortedStudents.sort((a, b) => b.score - a.score); // Urutkan dari skor tertinggi ke terendah

        const groupSize = Math.round(0.27 * numStudents); // Hitung 27% dan bulatkan
        const topGroupStudents = sortedStudents.slice(0, groupSize); // Ambil kelompok atas
        const bottomGroupStudents = sortedStudents.slice(numStudents - groupSize, numStudents); // Ambil kelompok bawah

        displayGroupAnalysis(topGroupStudents, bottomGroupStudents, processedStudentAnswers);

        // --- Uji Tingkat Kesukaran ---
        const difficultyResults = calculateDifficultyIndex(questionCorrectCounts, numStudents);
        displayDifficultyIndex(difficultyResults);

        // --- Daya Pembeda ---
        const discriminatingPowerResults = calculateDiscriminativePower(processedStudentAnswers, topGroupStudents, bottomGroupStudents, numQuestions);
        displayDiscriminativePower(discriminatingPowerResults);

        // --- Uji Validitas ---
        const validityResults = calculateValidity(processedStudentAnswers, studentScores, numQuestions, numStudents);
        displayValidityTest(validityResults);

        // --- Uji Reliabilitas KR-20 ---
        const reliabilityResult = calculateReliability(processedStudentAnswers, numQuestions, numStudents, questionCorrectCounts);
        displayReliabilityTest(reliabilityResult);

        analysisResults.style.display = 'block'; // Tampilkan hasil analisis
    });

    // --- FUNGSI-FUNGSI PEMBANTU (DISPLAY DATA) ---

    function displayScoreSummary(studentScores) {
        let html = '<h3>Jumlah Jawaban Benar per Anak:</h3>';
        html += '<table><tr><th>Siswa</th><th>Jumlah Benar</th></tr>';
        studentScores.forEach((score, index) => {
            html += `<tr><td>Siswa ${index + 1}</td><td>${score}</td></tr>`;
        });
        html += '</table>';
        scoreSummary.innerHTML = html;
    }

    function displayQuestionCorrectSummary(questionCorrectCounts) {
        let html = '<h3>Jumlah Anak yang Menjawab Benar per Soal:</h3>';
        html += '<table><tr><th>Soal</th><th>Jumlah Anak Benar</th></tr>';
        questionCorrectCounts.forEach((count, index) => {
            html += `<tr><td>Soal ${index + 1}</td><td>${count}</td></tr>`;
        });
        html += '</table>';
        questionCorrectSummary.innerHTML = html;
    }

    function displayStudentRanking(studentScores) {
        const rankedStudents = studentScores.map((score, index) => ({ student: `Siswa ${index + 1}`, score: score }));
        rankedStudents.sort((a, b) => b.score - a.score);

        let html = '<h3>Peringkat Siswa (Jumlah Benar Terbanyak ke Terkecil):</h3>';
        html += '<table><tr><th>Peringkat</th><th>Siswa</th><th>Jumlah Benar</th></tr>';
        rankedStudents.forEach((student, index) => {
            html += `<tr><td>${index + 1}</td><td>${student.student}</td><td>${student.score}</td></tr>`;
        });
        html += '</table>';
        studentRanking.innerHTML = html;
    }

    function displayGroupAnalysis(topGroupStudents, bottomGroupStudents, processedStudentAnswers) {
        let html = '<h3>Analisis Kelompok Atas dan Bawah (27%):</h3>';
        html += '<h4>Kelompok Atas:</h4>';
        html += '<ul>';
        topGroupStudents.forEach(student => {
            html += `<li>Siswa ${student.originalIndex + 1} (Skor: ${student.score})</li>`;
        });
        html += '</ul>';

        html += '<h4>Kelompok Bawah:</h4>';
        html += '<ul>';
        bottomGroupStudents.forEach(student => {
            html += `<li>Siswa ${student.originalIndex + 1} (Skor: ${student.score})</li>`;
        });
        html += '</ul>';

        groupAnalysisDiv.innerHTML = html;
    }

    // --- FUNGSI-FUNGSI PERHITUNGAN STATISTIK ---

    // 8. Hitung uji tingkat kesukaran
    function calculateDifficultyIndex(questionCorrectCounts, numStudents) {
        const results = [];
        for (let i = 0; i < numQuestions; i++) {
            const difficulty = questionCorrectCounts[i] / numStudents;
            let conclusion = '';
            if (difficulty < 0.31) {
                conclusion = 'Sukar';
            } else if (difficulty < 0.71) {
                conclusion = 'Sedang';
            } else {
                conclusion = 'Mudah';
            }
            results.push({ question: `Soal ${i + 1}`, difficulty: difficulty.toFixed(2), conclusion });
        }
        return results;
    }

    function displayDifficultyIndex(results) {
        let html = '<h3>Uji Tingkat Kesukaran:</h3>';
        html += '<table><tr><th>Soal</th><th>Tingkat Kesukaran</th><th>Kesimpulan</th></tr>';
        results.forEach(result => {
            html += `<tr><td>${result.question}</td><td>${result.difficulty}</td><td>${result.conclusion}</td></tr>`;
        });
        html += '</table>';
        difficultyIndexDiv.innerHTML = html;
    }

    // 9. Hitung daya pembeda
    function calculateDiscriminativePower(processedStudentAnswers, topGroupStudents, bottomGroupStudents, numQuestions) {
        const results = [];
        for (let q = 0; q < numQuestions; q++) {
            let topCorrect = 0;
            topGroupStudents.forEach(student => {
                topCorrect += processedStudentAnswers[student.originalIndex][q];
            });

            let bottomCorrect = 0;
            bottomGroupStudents.forEach(student => {
                bottomCorrect += processedStudentAnswers[student.originalIndex][q];
            });

            const averageTop = topCorrect / topGroupStudents.length;
            const averageBottom = bottomCorrect / bottomGroupStudents.length;
            const discriminatingPower = (averageTop - averageBottom) / 1; // Dibagi 1 sesuai permintaan Anda

            let conclusion = '';
            if (discriminatingPower < 0.21) {
                conclusion = 'Buruk';
            } else if (discriminatingPower < 0.41) {
                conclusion = 'Cukup';
            } else if (discriminatingPower < 0.71) {
                conclusion = 'Baik';
            } else {
                conclusion = 'Sangat Baik';
            }
            results.push({ question: `Soal ${q + 1}`, power: discriminatingPower.toFixed(2), conclusion });
        }
        return results;
    }

    function displayDiscriminativePower(results) {
        let html = '<h3>Daya Pembeda:</h3>';
        html += '<table><tr><th>Soal</th><th>Daya Pembeda</th><th>Kesimpulan</th></tr>';
        results.forEach(result => {
            html += `<tr><td>${result.question}</td><td>${result.power}</td><td>${result.conclusion}</td></tr>`;
        });
        html += '</table>';
        discriminatingPowerDiv.innerHTML = html;
    }

    // 10. Hitung uji validitas (Korelasi Pearson)
    // Fungsi untuk menghitung rata-rata
    function calculateMean(arr) {
        return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    }

    // Fungsi untuk menghitung standar deviasi populasi (pembagi N)
    function calculateStdDev(arr, mean) {
        if (arr.length === 0) return 0;
        const sqDiff = arr.map(val => Math.pow(val - mean, 2));
        const avgSqDiff = calculateMean(sqDiff); // Ini adalah varians populasi
        return Math.sqrt(avgSqDiff);
    }

    // Fungsi untuk menghitung korelasi Pearson
    function calculatePearsonCorrelation(x, y) {
        const n = x.length;
        if (n === 0) return NaN;

        // Cek jika salah satu array tidak bervariasi (semua nilainya sama)
        // Korelasi tidak terdefinisi dalam kasus ini, akan menghasilkan pembagian 0
        if (x.every(val => val === x[0]) || y.every(val => val === y[0])) {
            return NaN;
        }

        const meanX = calculateMean(x);
        const meanY = calculateMean(y);

        let numerator = 0;
        for (let i = 0; i < n; i++) {
            numerator += (x[i] - meanX) * (y[i] - meanY);
        }

        const stdDevX = calculateStdDev(x, meanX);
        const stdDevY = calculateStdDev(y, meanY);

        const denominator = stdDevX * stdDevY * n; // Pembagi N untuk korelasi Pearson

        if (denominator === 0) return 0; // Seharusnya sudah tertangani oleh cek variasi di atas
        return numerator / denominator;
    }

    function calculateValidity(processedStudentAnswers, studentScores, numQuestions, numStudents) {
        const results = [];
        const rTable = getRTableValue(numStudents); // Ambil r-tabel sesuai N

        for (let q = 0; q < numQuestions; q++) {
            const questionAnswers = processedStudentAnswers.map(student => student[q]); // Ambil jawaban 0/1 untuk soal ini
            const rHitung = calculatePearsonCorrelation(questionAnswers, studentScores); // Hitung korelasi

            let conclusion = '';
            if (isNaN(rHitung)) {
                conclusion = 'Tidak dapat dihitung (data tidak bervariasi)';
            } else if (Math.abs(rHitung) > rTable) { // Bandingkan rHitung absolut dengan rTabel
                conclusion = 'Valid';
            } else {
                conclusion = 'Tidak Valid';
            }
            results.push({ question: `Soal ${q + 1}`, rHitung: isNaN(rHitung) ? 'N/A' : rHitung.toFixed(3), rTable: rTable.toFixed(3), conclusion });
        }
        return results;
    }

    // Fungsi untuk mendapatkan nilai r-tabel dari gambar yang disediakan (Taraf Signifikansi 5%)
    function getRTableValue(n) {
        const rTable5Percent = {
            3: 0.997, 4: 0.950, 5: 0.878, 6: 0.811, 7: 0.754, 8: 0.707, 9: 0.666, 10: 0.632,
            11: 0.602, 12: 0.576, 13: 0.553, 14: 0.532, 15: 0.514, 16: 0.497, 17: 0.482,
            18: 0.468, 19: 0.456, 20: 0.444, 21: 0.433, 22: 0.423, 23: 0.413, 24: 0.404,
            25: 0.396, 26: 0.388, 27: 0.381, 28: 0.374, 29: 0.367, 30: 0.361, 31: 0.355,
            32: 0.349, 33: 0.344, 34: 0.339, 35: 0.334, 36: 0.329, 37: 0.325, 38: 0.320,
            39: 0.316, 40: 0.312, 41: 0.308, 42: 0.304, 43: 0.301, 44: 0.297, 45: 0.294,
            46: 0.291, 47: 0.288, 48: 0.284, 49: 0.281, 50: 0.279, 55: 0.266, 60: 0.254,
            65: 0.244, 70: 0.235, 75: 0.227, 80: 0.220, 85: 0.213, 90: 0.207, 95: 0.202,
            100: 0.195, 125: 0.176, 150: 0.159, 175: 0.148, 200: 0.138, 300: 0.113,
            400: 0.098, 500: 0.088, 600: 0.080, 700: 0.074, 800: 0.070, 900: 0.065, 1000: 0.062
        };

        if (rTable5Percent.hasOwnProperty(n)) {
            return rTable5Percent[n];
        }

        // Handle N < 3 (korelasi tidak terdefinisi secara statistik)
        if (n < 3) return Infinity;

        // Interpolasi atau ambil nilai terdekat jika N tidak persis ada di tabel
        const sortedNs = Object.keys(rTable5Percent).map(Number).sort((a, b) => a - b);

        // Jika N lebih besar dari nilai terbesar di tabel, gunakan nilai terakhir
        if (n > sortedNs[sortedNs.length - 1]) {
            return rTable5Percent[sortedNs[sortedNs.length - 1]];
        }

        let lowerN = sortedNs[0];
        let upperN = sortedNs[sortedNs.length - 1];

        for (let i = 0; i < sortedNs.length; i++) {
            if (sortedNs[i] === n) {
                return rTable5Percent[n]; // Found exact match
            }
            if (sortedNs[i] < n) {
                lowerN = sortedNs[i];
            }
            if (sortedNs[i] > n) {
                upperN = sortedNs[i];
                break;
            }
        }

        // Lakukan interpolasi linear jika N berada di antara dua titik yang diketahui
        if (lowerN !== upperN) {
            const lowerR = rTable5Percent[lowerN];
            const upperR = rTable5Percent[upperN];
            // Interpolasi: r = r_lower + (r_upper - r_lower) * ((n - N_lower) / (N_upper - N_lower))
            return lowerR + (upperR - lowerR) * ((n - lowerN) / (upperN - lowerN));
        }

        return rTable5Percent[n]; // Fallback (seharusnya sudah tertangani oleh lookup atau interpolasi)
    }

    function displayValidityTest(results) {
        let html = '<h3>Uji Validitas:</h3>';
        html += '<table><tr><th>Soal</th><th>r Hitung</th><th>r Tabel (N, &#945;=0.05)</th><th>Kesimpulan</th></tr>';
        results.forEach(result => {
            html += `<tr><td>${result.question}</td><td>${result.rHitung}</td><td>${result.rTable}</td><td>${result.conclusion}</td></tr>`;
        });
        html += '</table>';
        html += '<p><small>Catatan: Nilai r Tabel diambil dari tabel yang disediakan pada Taraf Signifikansi 5%.</small></p>';
        validityTestDiv.innerHTML = html;
    }

    // 11. Uji reliabilitas (KR-20)
    function calculateReliability(processedStudentAnswers, numQuestions, numStudents, questionCorrectCounts) {
        if (numQuestions === 0 || numStudents === 0) {
            return { reliability: NaN, conclusion: 'Tidak dapat dihitung' };
        }

        let sumPQ = 0; // Ini adalah "PQ Total" (sum of item variances)
        const pPerQuestion = [];
        const qPerQuestion = [];
        const pqPerQuestion = []; // Untuk menyimpan P*Q setiap soal
        const itemVariances = []; // Ini adalah array untuk menyimpan "Varians" per soal seperti di Excel Anda (VAR.S dari 0/1)

        for (let q = 0; q < numQuestions; q++) {
            // Proporsi benar dan salah
            const P = questionCorrectCounts[q] / numStudents;
            const Q = 1 - P;
            const currentPQ = P * Q; // Varians populasi item untuk soal ini (P*Q)
            
            pPerQuestion.push(P);
            qPerQuestion.push(Q);
            pqPerQuestion.push(currentPQ); // Simpan P*Q (sebagai "PQ")

            // Ambil semua jawaban 0/1 untuk soal 'q' dari semua siswa
            const itemResponses = processedStudentAnswers.map(student => student[q]); 
            // Hitung varians SAMPEL dari deret jawaban 0/1 untuk soal ini
            const varianceForItem = calculateSampleVariance(itemResponses); 
            itemVariances.push(varianceForItem); // Simpan varians SAMPEL per soal (ini yang Anda maksud "Varians")

            sumPQ += currentPQ; // Akumulasi total PQ
        }


        // Hitung Varians Total Skor sebagai SUM dari VARIANS (tiap soal)
        const varianceTotal = itemVariances.reduce((sum, val) => sum + val, 0); // PERHITUNGAN SESUAI PERMINTAAN TERAKHIR ANDA


        let reliabilityKR20 = 0;
        if (numQuestions > 1 && varianceTotal > 0) {
             reliabilityKR20 = (numQuestions / (numQuestions - 1)) * (1 - (sumPQ / varianceTotal));
        } else {
            reliabilityKR20 = NaN;
        }

        let conclusion = '';
        if (isNaN(reliabilityKR20)) {
             conclusion = 'Tidak dapat dihitung (jumlah soal kurang dari 2 atau varians skor total nol)';
        } else if (reliabilityKR20 < 0.5) {
            conclusion = 'Reliabilitas Sangat Rendah';
        } else if (reliabilityKR20 < 0.7) {
            conclusion = 'Reliabilitas Rendah';
        } else if (reliabilityKR20 < 0.9) {
            conclusion = 'Reliabilitas Tinggi';
        } else {
            conclusion = 'Reliabilitas Sangat Tinggi';
        }

        // Mengembalikan objek yang berisi semua detail untuk ditampilkan
        return {
            pPerQuestion: pPerQuestion,
            qPerQuestion: qPerQuestion,
            pqPerQuestion: pqPerQuestion, // "PQ" per soal (P*Q)
            itemVariances: itemVariances, // "Varians" per soal (VAR.S dari 0/1)
            sumPQ: sumPQ, // "PQ Total" (sum of P*Q)
            totalScores: totalScores,
            varianceTotal: varianceTotal, // Varians Total Skor (kini sum(itemVariances))
            reliability: reliabilityKR20,
            conclusion: conclusion
        };
    }

    // Fungsi untuk menghitung varians sampel (pembagi N-1)
    function calculateSampleVariance(arr) {
        const n = arr.length;
        if (n <= 1) return 0;

        const mean = calculateMean(arr);
        let sumOfSquaredDifferences = 0;
        for (let i = 0; i < n; i++) {
            sumOfSquaredDifferences += Math.pow(arr[i] - mean, 2);
        }
        return sumOfSquaredDifferences / (n - 1);
    }

    // Fungsi untuk menghitung varians POPULASI (pembagi N)
    function calculatePopulationVariance(arr) {
        const n = arr.length;
        if (n === 0) return 0;
        const mean = calculateMean(arr);
        let sumOfSquaredDifferences = 0;
        for (let i = 0; i < n; i++) {
            sumOfSquaredDifferences += Math.pow(arr[i] - mean, 2);
        }
        return sumOfSquaredDifferences / n;
    }


    // Fungsi untuk menampilkan hasil reliabilitas dengan format yang diminta
    function displayReliabilityTest(result) {
        let html = '<h3>Uji Reliabilitas (KR-20):</h3>';

        // Tabel P, Q, PQ, Varians per soal
        html += '<h4>Detail Per Soal:</h4>';
        html += '<table>';
        html += '<thead><tr><th>Soal</th><th>P</th><th>Q</th><th>PQ</th><th>Varians</th></tr></thead>';
        html += '<tbody>';
        for (let i = 0; i < numQuestions; i++) {
            html += `<tr>
                <td>Soal ${i + 1}</td>
                <td>${result.pPerQuestion[i].toFixed(3)}</td>
                <td>${result.qPerQuestion[i].toFixed(3)}</td>
                <td>${result.pqPerQuestion[i].toFixed(3)}</td>
                <td>${result.itemVariances[i].toFixed(3)}</td>
            </tr>`;
        }
        html += '</tbody></table>';

        // Ringkasan Reliabilitas
        html += '<h4>Ringkasan:</h4>';
        html += '<table>';
        html += '<tr><th>Metrik</th><th>Nilai</th></tr>';
        html += `<tr><td>PQ Total</td><td>${result.sumPQ.toFixed(3)}</td></tr>`;
        html += `<tr><td>Varians Total Skor</td><td>${result.varianceTotal.toFixed(3)}</td></tr>`; // Ini adalah sum(itemVariances)
        html += `<tr><td>Reliabilitas KR-20</td><td><strong>${isNaN(result.reliability) ? 'N/A' : result.reliability.toFixed(3)}</strong></td></tr>`;
        html += `<tr><td>Kesimpulan</td><td><strong>${result.conclusion}</strong></td></tr>`;
        html += '</table>';

        reliabilityTestDiv.innerHTML = html;
    }
});