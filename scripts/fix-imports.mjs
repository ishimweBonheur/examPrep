import fs from 'fs'
import path from 'path'

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.tsx?$/.test(entry.name)) {
      let content = fs.readFileSync(full, 'utf8')
      const original = content
      content = content.replaceAll('@/api/base44Client', '@/api/client')
      content = content.replace(/\): JSX\.Element \{/g, ') {')
      content = content.replace(/import moment from 'moment';/g, "import { formatDate, todayISO, addDays, addMonths, daysUntil } from '@/lib/format-date';")
      content = content.replace(/import moment from "moment";/g, 'import { formatDate, todayISO, addDays, addMonths, daysUntil } from "@/lib/format-date";')
      content = content.replace(/import \{ toast \} from 'sonner';/g, "import toast from 'react-hot-toast';")
      content = content.replace(/moment\(([^)]+)\)\.format\('MMM D, YYYY'\)/g, "formatDate($1, 'short')")
      content = content.replace(/moment\(([^)]+)\)\.format\('MMM D'\)/g, "formatDate($1, 'short')")
      content = content.replace(/moment\(([^)]+)\)\.fromNow\(\)/g, "formatDate($1, 'relative')")
      content = content.replace(/moment\(\)\.format\('YYYY-MM-DD'\)/g, 'todayISO()')
      content = content.replace(/moment\(\)\.add\(TRIAL_DAYS, 'days'\)\.format\('YYYY-MM-DD'\)/g, 'addDays(TRIAL_DAYS)')
      content = content.replace(/moment\(\)\.add\(billingCycle === 'yearly' \? 12 : 1, 'months'\)\.format\('YYYY-MM-DD'\)/g, "addMonths(billingCycle === 'yearly' ? 12 : 1)")
      content = content.replace(
        /const trialEndDate = currentSub\?\.trial_end_date \? moment\(currentSub\.trial_end_date\) : null;\s*const trialDaysLeft = trialEndDate \? trialEndDate\.diff\(moment\(\), 'days'\) : 0;/g,
        'const trialDaysLeft = currentSub?.trial_end_date ? daysUntil(currentSub.trial_end_date) : 0;'
      )
      if (content !== original) fs.writeFileSync(full, content)
    }
  }
}

walk('src')
console.log('Fixed imports')
