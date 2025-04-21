import React, { useRef, useState } from 'react';

const ApprovalForm = () => {
  const editorRef = useRef();

  const [form, setForm] = useState({
    loaTitle: '',
    writer: '',
    department: '',
    approver: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAutoInsert = () => {
    const editorInstance = editorRef.current.getInstance();
    const autoText = `
## 📋 결재 문서 정보

- **제목**: ${form.loaTitle}
- **작성자**: ${form.writer}
- **부서**: ${form.department}
- **결재자**: ${form.approver}

---

하단에 결재 내용을 작성해주세요.
    `;

    editorInstance.setMarkdown(autoText);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const editorInstance = editorRef.current.getInstance();
    const content = editorInstance.getMarkdown();

    // 이후 FormData로 서버 제출 가능
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📄 품의서 작성</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>제목</label><br />
          <input type="text" name="loaTitle" value={form.loaTitle} onChange={handleChange} required />
        </div>

        <div>
          <label>작성자</label><br />
          <input type="text" name="writer" value={form.writer} onChange={handleChange} required />
        </div>

        <div>
          <label>부서</label><br />
          <input type="text" name="department" value={form.department} onChange={handleChange} required />
        </div>

        <div>
          <label>결재자</label><br />
          <input type="text" name="approver" value={form.approver} onChange={handleChange} required />
        </div>

        <br />
        <button type="button" onClick={handleAutoInsert}>📥 본문 자동 생성</button>

        <br />
        <button type="submit">📨 제출</button>
      </form>
    </div>
  );
};

export default ApprovalForm;
