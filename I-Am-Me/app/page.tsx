import Site from '@/components/Site';
import { getPortfolioData } from '@/lib/github';
import { site } from '@/site.config';

export default async function Page() {
  const { repos, profile } = await getPortfolioData();
  return <Site repos={repos} profile={profile} user={site.user} pinned={site.pinned} />;
}
