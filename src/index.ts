import _ from 'lodash';

import { FailedPackage, Package, SuccessfulPackage } from '@scrutiny/core';
import { Builder, ObjectBuilder } from '@scrutiny/core/util';
import deepInstallDetails from '@scrutiny/deep-install-details';

// SCRIPT INFO
// tslint:disable-next-line
export interface IScriptInformation {
}

// VERSION INFO
// tslint:disable-next-line
export interface IVersionInformation {
}

// SECURITY INFO
// tslint:disable-next-line
export interface ISecurityInformation {
}

// AUTHOR INFO
export interface IAuthorInformation {
  info: IAuthorSummary[];
}
export interface IAuthorSummary {
  author: string;
  publishedPackages: Package[];
}

// META INFO
export interface IMetaInformation {
  allInstalledPackages: Package[];
  successFullyInstalledPackages: SuccessfulPackage[];
  failedInstalledPackages: FailedPackage[];
  installErrors: IInstallErrorSummary[];
  alphaPackages: SuccessfulPackage[];
  betaPackages: SuccessfulPackage[];
}
export interface IInstallErrorSummary {
  error: string;
  count: number;
}


export interface IScrutinyAnalysis {
  scripts: IScriptInformation;
  version: IVersionInformation;
  security: ISecurityInformation;
  authors: IAuthorInformation;
  meta: IMetaInformation;
}

export async function analyse(...packageSpecifiers: string[]): Promise<IScrutinyAnalysis> {
  // Create Builder objects
  let scriptsInfo: Builder<IScriptInformation> = ObjectBuilder.create<IScriptInformation>();
  let versionInfo: Builder<IVersionInformation> = ObjectBuilder.create<IVersionInformation>();
  let securityInfo: Builder<ISecurityInformation> = ObjectBuilder.create<ISecurityInformation>();
  let authorInfo: Builder<IAuthorInformation> = ObjectBuilder.create<IAuthorInformation>();
  let metaInfo: Builder<IMetaInformation> = ObjectBuilder.create<IMetaInformation>();
  let scrutinyBuilder: Builder<IScrutinyAnalysis> = ObjectBuilder.create<IScrutinyAnalysis>({
    scripts: scriptsInfo,
    version: versionInfo,
    security: securityInfo,
    authors: authorInfo,
    meta: metaInfo,
  });

  let allPackages: Package[] = await deepInstallDetails(...packageSpecifiers);

  let successfullyInstalledPackages: SuccessfulPackage[] = allPackages.filter((pkg: Package) => pkg.didSucceed()) as SuccessfulPackage[];
  let failedInstalledPackages: FailedPackage[] = allPackages.filter((pkg: Package) => pkg.didFail()) as FailedPackage[];


  // ------------------------
  // -- AUTHOR INFORMATION --
  // ------------------------
  // INFO
  let packagesGroupedByAuthor = _.groupBy(successfullyInstalledPackages, (pkg: SuccessfulPackage) => pkg.details.publishAuthor);
  authorInfo.info = _.chain(packagesGroupedByAuthor)
    .toPairs()
    .map(([author, publishedPackages]) => {
      let authorSummary: IAuthorSummary = {
        author,
        publishedPackages,
      };

      return authorSummary;
    })
    .orderBy(['publishedPackages.length', 'author'], ['desc', 'asc'])
    .value();


  // ----------------------
  // -- META INFORMATION --
  // ----------------------
  // ALL INSTALLED PACKAGES
  metaInfo.allInstalledPackages = allPackages;
  // SUCCESSFULLY INSTALLED PACKAGES
  metaInfo.successFullyInstalledPackages = successfullyInstalledPackages;
  // FAILED INSTALLED PACKAGES
  metaInfo.failedInstalledPackages = failedInstalledPackages;
  // INSTALL ERRORS
  metaInfo.installErrors = _.chain(failedInstalledPackages)
    // Map them into `error: count` keyValue pairs
    .countBy((pkg: Package) => pkg.error)
    .toPairs()
    .map(([error, count]) => ({ error, count }) as IInstallErrorSummary)
    // Order by
    .orderBy('count', 'desc')
    .value();
  // ALPHA PACKAGES
  metaInfo.alphaPackages = _.chain(successfullyInstalledPackages)
    .filter((pkg) => pkg.details.version.startsWith('0.0.'))
    .value();
  // BETA PACKAGES
  metaInfo.betaPackages = _.chain(successfullyInstalledPackages)
    .filter((pkg) => pkg.details.version.startsWith('0.') && !pkg.details.version.startsWith('0.0.'))
    .value();

  return ObjectBuilder.assemble(scrutinyBuilder);
}