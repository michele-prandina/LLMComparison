// Token estimation utilities

// Estimate tokens from text (approximately 1.3 tokens per word for English)
export function estimateTokens(text) {
    if (!text || typeof text !== 'string') return 0;

    // Count words (split by whitespace)
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Estimate tokens (average 1.3 tokens per word)
    // This accounts for subword tokenization used by most LLMs
    return Math.ceil(wordCount * 1.3);
}

// Read file as text (handles multiple formats including PDF)
export async function readFileAsText(file) {
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    const textTypes = ['.txt', '.md', '.json', '.csv', '.xml', '.html', '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.css', '.scss', '.yaml', '.yml', '.toml', '.ini', '.log', '.sh', '.bash', '.env'];

    if (extension === '.pdf') {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfjsLib = await import('pdfjs-dist/build/pdf');
            // Use unpkg as it's more reliable for specific versions of pdfjs-dist
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

            const pdf = await pdfjsLib.getDocument({
                data: arrayBuffer,
                standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
            }).promise;
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items.map(item => item.str).join(' ');
                text += pageText + '\n';
            }
            return {
                name: file.name,
                size: file.size,
                content: text,
                type: file.type
            };
        } catch (err) {
            console.error('PDF parsing error:', err);
            throw new Error(`Failed to parse PDF: ${file.name}`);
        }
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            resolve({
                name: file.name,
                size: file.size,
                content: e.target.result,
                type: file.type
            });
        };

        reader.onerror = (e) => {
            reject(new Error(`Failed to read file: ${file.name}`));
        };

        if (textTypes.includes(extension) || file.type.startsWith('text/')) {
            reader.readAsText(file);
        } else {
            reject(new Error(`Unsupported file type: ${file.name}`));
        }
    });
}

// Format token count for display
export function formatTokenCount(count) {
    if (count >= 1_000_000) {
        return (count / 1_000_000).toFixed(2) + 'M';
    }
    if (count >= 1_000) {
        return (count / 1_000).toFixed(1) + 'K';
    }
    return count.toString();
}

// Format currency
export function formatCurrency(amount) {
    if (amount < 0.01) {
        return '$' + amount.toFixed(6);
    }
    if (amount < 1) {
        return '$' + amount.toFixed(4);
    }
    return '$' + amount.toFixed(2);
}
