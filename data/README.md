# NMLS Study Materials & Knowledge Base

This directory contains study materials and extracted content for generating NMLS exam questions.

## Directory Structure

```
data/
├── study-materials/          # Original PDF files
│   └── Exam Prep Memory Charts 4.2025.pdf
├── extracted-content/        # Extracted text from PDFs
│   └── exam-prep-memory-charts.txt
└── README.md                 # This file
```

## Adding New Study Materials

1. **Add PDF to study-materials/**
   ```bash
   cp "path/to/new-study-guide.pdf" data/study-materials/
   ```

2. **Extract text content**
   ```bash
   pdftotext "data/study-materials/new-study-guide.pdf" "data/extracted-content/new-study-guide.txt"
   ```

3. **Process into questions**

   **Option A: CLI Script (Recommended for initial setup)**
   ```bash
   npx tsx scripts/process-study-materials.ts
   ```

   **Option B: Admin API (For production use)**
   - Login as admin
   - POST to `/api/admin/knowledge-base/process`
   - Monitor progress in admin dashboard

## How It Works

### 1. Content Extraction
PDF files are converted to plain text using `pdftotext` (part of poppler-utils).

### 2. Section Parsing
The `KnowledgeBaseService` parses extracted text into sections based on:
- All-caps headers (e.g., "RESPA", "TILA")
- Topic patterns (e.g., "FHA", "Mortgage Markets")
- Chart titles

### 3. Content Area Mapping
Each section is automatically mapped to a content area:
- **Federal Laws**: RESPA, TILA, FCRA, Disclosures
- **Mortgage Knowledge**: FHA, VA, USDA, Conventional loans
- **Loan Origination**: Application process, origination
- **Ethics**: Professional conduct
- **Uniform State**: State-specific content

### 4. Question Generation
For each section, the AI generates 5 questions:
- 2 EASY questions (basic recall)
- 2 MEDIUM questions (application)
- 1 HARD question (analysis/synthesis)

All questions follow the format:
```typescript
{
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "optionA" | "optionB" | "optionC" | "optionD";
  explanation: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}
```

### 5. Database Storage
Generated questions are saved to the database with:
- Content area association
- Sub-topic assignment
- Bloom's taxonomy level
- Review status (PENDING for admin review)

## Current Content

### Exam Prep Memory Charts (v2.0, April 2025)
**Topics covered:**
- Mortgage Markets (Primary/Secondary)
- Loan Programs:
  - FHA (insured loans)
  - VA (guaranteed loans)
  - USDA (rural housing)
  - Conventional (Conforming/Non-Conforming)
- RESPA (Referrals, Escrows, Servicing, Purchase Book, ABA)
- TILA (Finance charges, disclosures)
- Disclosure timeline (LE, CD, ABA, CHARM, etc.)
- FCRA (Fair Credit Reporting Act)

## Statistics

Check current knowledge base stats:
```bash
# CLI
npx tsx -e "import { KnowledgeBaseService } from './src/services/KnowledgeBaseService'; KnowledgeBaseService.getKnowledgeBaseStats().then(console.log)"

# API (admin only)
curl -X GET https://your-app.com/api/admin/knowledge-base/process \
  -H "Cookie: next-auth.session-token=..."
```

## Best Practices

1. **Version Control**: Keep original PDFs in version control
2. **Incremental Updates**: Add new materials incrementally
3. **Admin Review**: Always review AI-generated questions before activating
4. **Rate Limiting**: Processing includes 2-second delays to avoid API rate limits
5. **Backup**: Export questions periodically using Prisma

## Troubleshooting

### "No sections found"
- Check if PDF text extraction worked correctly
- Verify headers are in expected format (all-caps, specific keywords)

### "No sub-topic found"
- Ensure content areas and sub-topics are seeded in database
- Run: `npx prisma db seed`

### "API rate limit exceeded"
- Increase delay between sections in `KnowledgeBaseService.batchProcessStudyMaterials()`
- Process fewer sections at a time

## Future Enhancements

- [ ] Support for images/diagrams
- [ ] Multi-language support
- [ ] Automatic content area detection using AI
- [ ] Question quality scoring
- [ ] Duplicate detection
- [ ] Adaptive difficulty balancing
