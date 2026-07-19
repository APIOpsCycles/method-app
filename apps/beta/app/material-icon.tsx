import type { SVGProps } from "react";

import AnalyticsOutline from "~icons/material-symbols-light/analytics-outline";
import Api from "~icons/material-symbols-light/api";
import AreaChartOutline from "~icons/material-symbols-light/area-chart-outline";
import BrandAwarenessOutline from "~icons/material-symbols-light/brand-awareness-outline";
import BusinessCenterOutline from "~icons/material-symbols-light/business-center-outline";
import CasesOutline from "~icons/material-symbols-light/cases-outline";
import ChartDataOutline from "~icons/material-symbols-light/chart-data-outline";
import CheckBoxOutline from "~icons/material-symbols-light/check-box-outline";
import CheckCircle from "~icons/material-symbols-light/check-circle";
import CloudDoneOutline from "~icons/material-symbols-light/cloud-done-outline";
import CloudLockOutline from "~icons/material-symbols-light/cloud-lock-outline";
import Code from "~icons/material-symbols-light/code";
import CodeBlocksOutline from "~icons/material-symbols-light/code-blocks-outline";
import ContractOutline from "~icons/material-symbols-light/contract-outline";
import DashboardOutline from "~icons/material-symbols-light/dashboard-outline";
import DeployedCodeAccountOutline from "~icons/material-symbols-light/deployed-code-account-outline";
import DeployedCodeAlertOutline from "~icons/material-symbols-light/deployed-code-alert-outline";
import DeployedCodeOutline from "~icons/material-symbols-light/deployed-code-outline";
import DeployedCodeUpdateOutline from "~icons/material-symbols-light/deployed-code-update-outline";
import DesignServicesOutline from "~icons/material-symbols-light/design-services-outline";
import EditDocumentOutline from "~icons/material-symbols-light/edit-document-outline";
import FolderCodeOutline from "~icons/material-symbols-light/folder-code-outline";
import GavelRounded from "~icons/material-symbols-light/gavel-rounded";
import GlobeBookRounded from "~icons/material-symbols-light/globe-book-rounded";
import HandshakeOutline from "~icons/material-symbols-light/handshake-outline";
import IntegrationInstructionsOutline from "~icons/material-symbols-light/integration-instructions-outline";
import ListAltOutline from "~icons/material-symbols-light/list-alt-outline";
import ManageAccountsOutline from "~icons/material-symbols-light/manage-accounts-outline";
import MoneyBagOutline from "~icons/material-symbols-light/money-bag-outline";
import PsychologyOutline from "~icons/material-symbols-light/psychology-outline";
import RocketLaunchOutline from "~icons/material-symbols-light/rocket-launch-outline";
import SchoolOutline from "~icons/material-symbols-light/school-outline";
import StrategyOutline from "~icons/material-symbols-light/strategy-outline";
import TrophyOutline from "~icons/material-symbols-light/trophy-outline";
import UserAttributesOutline from "~icons/material-symbols-light/user-attributes-outline";

type IconComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element;

const icons: Record<string, IconComponent> = {
  "analytics-outline": AnalyticsOutline,
  api: Api,
  "area-chart-outline": AreaChartOutline,
  "brand-awareness-outline": BrandAwarenessOutline,
  "business-center-outline": BusinessCenterOutline,
  "cases-outline": CasesOutline,
  "chart-data-outline": ChartDataOutline,
  "check-box-outline": CheckBoxOutline,
  "check-circle": CheckCircle,
  "cloud-done-outline": CloudDoneOutline,
  "cloud-lock-outline": CloudLockOutline,
  code: Code,
  "code-blocks-outline": CodeBlocksOutline,
  "contract-outline": ContractOutline,
  "dashboard-outline": DashboardOutline,
  "deployed-code-account-outline": DeployedCodeAccountOutline,
  "deployed-code-alert-outline": DeployedCodeAlertOutline,
  "deployed-code-outline": DeployedCodeOutline,
  "deployed-code-update-outline": DeployedCodeUpdateOutline,
  "design-services-outline": DesignServicesOutline,
  "edit-document-outline": EditDocumentOutline,
  "folder-code-outline": FolderCodeOutline,
  "gavel-rounded": GavelRounded,
  "globe-book-rounded": GlobeBookRounded,
  "handshake-outline": HandshakeOutline,
  "integration-instructions-outline": IntegrationInstructionsOutline,
  "list-alt-outline": ListAltOutline,
  "manage-accounts-outline": ManageAccountsOutline,
  "money-bag-outline": MoneyBagOutline,
  "psychology-outline": PsychologyOutline,
  "rocket-launch-outline": RocketLaunchOutline,
  "school-outline": SchoolOutline,
  "strategy-outline": StrategyOutline,
  "trophy-outline": TrophyOutline,
  "user-attributes-outline": UserAttributesOutline,
};

export const materialIconNames = Object.keys(icons).sort();

function normalizeIconName(name?: string) {
  return name?.trim().replace(/_/g, "-").toLowerCase() ?? "";
}

export function hasMaterialIcon(name?: string) {
  return Boolean(icons[normalizeIconName(name)]);
}

type MaterialIconProps = SVGProps<SVGSVGElement> & {
  name?: string;
  title?: string;
};

export function MaterialIcon({ name, title, className, ...props }: MaterialIconProps) {
  const Icon = icons[normalizeIconName(name)];
  if (!Icon) return null;

  return (
    <Icon
      {...props}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={["material-icon", className].filter(Boolean).join(" ")}
      focusable="false"
      role={title ? "img" : undefined}
    />
  );
}
