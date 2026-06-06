const fs = require('fs');

function replaceFile(file, regex, replacement) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
  } catch (e) {
    console.error(`Error in ${file}:`, e.message);
  }
}

replaceFile('src/components/insights/CollapsibleInsightCard.tsx', /import \{ ReactNode \}/, 'import { type ReactNode }');
replaceFile('src/components/monthly/CommittedExpensesList.tsx', /\s*setShowEditModal,/, '');
replaceFile('src/pages/AboutPage.tsx', /ArrowLeft,\s*/, '');
replaceFile('src/pages/AboutPage.tsx', /\s*const navigate = useNavigate\(\);\n/, '\n');
replaceFile('src/pages/EditProfilePage.tsx', /ArrowLeft,\s*/, '');
replaceFile('src/pages/Insights.tsx', /import \{ Tooltip \} from "\.\.\/components\/ui\/Tooltip";\n/, '');
replaceFile('src/pages/ManageCategoriesPage.tsx', /ArrowLeft, /, '');
replaceFile('src/pages/ManageCategoriesPage.tsx', /, Trash2/, '');
replaceFile('src/pages/ManageCategoriesPage.tsx', /\s*const navigate = useNavigate\(\);\n/, '\n');
replaceFile('src/pages/MonthlyView.tsx', /\s*const spentPct = [^\n]+\n/, '\n');
replaceFile('src/pages/MonthlyView.tsx', /\s*const overBudget = [^\n]+\n/, '\n');
replaceFile('src/pages/NotificationsPage.tsx', /ArrowLeft, /, '');
replaceFile('src/pages/NotificationsPage.tsx', /\s*const navigate = useNavigate\(\);\n/, '\n');
replaceFile('src/pages/SavingsView.tsx', /, ArrowLeft/, '');

