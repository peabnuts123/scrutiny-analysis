import _ from 'lodash';
import packageArg, { Result as PackageArg } from 'npm-package-arg';

import { IFailedPackage, ISuccessfulPackage, Package } from '@scrutiny/core';
import { Builder, ObjectBuilder, ValidateAs } from '@scrutiny/core/util';
import deepInstallDetails from '@scrutiny/deep-install-details';

// SCRIPT INFO
// tslint:disable-next-line:no-empty-interface
export interface IScriptInformation {
}
function AssembleScriptInformation(/* source: Builder<IScriptInformation> */): IScriptInformation {
  return {
  };
}

// VERSION INFO
// tslint:disable-next-line:no-empty-interface
export interface IVersionInformation {
}
function AssembleVersionInformation(/* source: Builder<IVersionInformation> */): IVersionInformation {
  return {
  };
}

// SECURITY INFO
// tslint:disable-next-line:no-empty-interface
export interface ISecurityInformation {
}
function AssembleSecurityInformation(/* source: Builder<ISecurityInformation> */): ISecurityInformation {
  return {
  };
}

// AUTHOR INFO
export interface IAuthorInformation {
  info: IAuthorSummary[];
}
function AssembleAuthorInformation(source: Builder<IAuthorInformation>): IAuthorInformation {
  return {
    info: ValidateAs.Required(source, 'info'),
  };
}

export interface IAuthorSummary {
  author: string;
  publishedPackages: Package[];
}

// META INFO
export interface IMetaInformation {
  requestedPackages: Package[];
  allInstalledPackages: Package[];
  successFullyInstalledPackages: ISuccessfulPackage[];
  failedInstalledPackages: IFailedPackage[];
  installErrors: IInstallErrorSummary[];
  alphaPackages: ISuccessfulPackage[];
  betaPackages: ISuccessfulPackage[];
}
function AssembleMetaInformation(source: Builder<IMetaInformation>): IMetaInformation {
  return {
    requestedPackages: ValidateAs.Required(source, 'requestedPackages'),
    allInstalledPackages: ValidateAs.Required(source, 'allInstalledPackages'),
    successFullyInstalledPackages: ValidateAs.Required(source, 'successFullyInstalledPackages'),
    failedInstalledPackages: ValidateAs.Required(source, 'failedInstalledPackages'),
    installErrors: ValidateAs.Required(source, 'installErrors'),
    alphaPackages: ValidateAs.Required(source, 'alphaPackages'),
    betaPackages: ValidateAs.Required(source, 'betaPackages'),
  };
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
function AssembleScrutinyAnalysis(source: Builder<IScrutinyAnalysis>): IScrutinyAnalysis {
  return {
    scripts: ValidateAs.Required(source, 'scripts'),
    version: ValidateAs.Required(source, 'version'),
    security: ValidateAs.Required(source, 'security'),
    authors: ValidateAs.Required(source, 'authors'),
    meta: ValidateAs.Required(source, 'meta'),
  };
}

export async function analyse(...userPackageSpecifiers: string[]): Promise<IScrutinyAnalysis> {
  // Create Builder objects
  let scriptsInfo: Builder<IScriptInformation> = ObjectBuilder.create(AssembleScriptInformation);
  let versionInfo: Builder<IVersionInformation> = ObjectBuilder.create(AssembleVersionInformation);
  let securityInfo: Builder<ISecurityInformation> = ObjectBuilder.create(AssembleSecurityInformation);
  let authorInfo: Builder<IAuthorInformation> = ObjectBuilder.create(AssembleAuthorInformation);
  let metaInfo: Builder<IMetaInformation> = ObjectBuilder.create(AssembleMetaInformation);
  let scrutinyBuilder: Builder<IScrutinyAnalysis> = ObjectBuilder.create(AssembleScrutinyAnalysis, {
    scripts: scriptsInfo,
    version: versionInfo,
    security: securityInfo,
    authors: authorInfo,
    meta: metaInfo,
  });

  let packageSpecifiers: PackageArg[] = userPackageSpecifiers.map((s) => packageArg(s));

  let allPackages: Package[] = await deepInstallDetails(...userPackageSpecifiers);

  let successfullyInstalledPackages: ISuccessfulPackage[] = allPackages.filter((pkg: Package) => pkg.didSucceed()) as ISuccessfulPackage[];
  let failedInstalledPackages: IFailedPackage[] = allPackages.filter((pkg: Package) => pkg.didFail()) as IFailedPackage[];


  // ------------------------
  // -- AUTHOR INFORMATION --
  // ------------------------
  // INFO
  let packagesGroupedByAuthor = _.groupBy(successfullyInstalledPackages, (pkg: ISuccessfulPackage) => pkg.details.publishAuthor);
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
  metaInfo.requestedPackages = _.chain(allPackages)
    .filter((pkg: Package) => {
      return _.some(packageSpecifiers, (pkgSpecifier) => pkg.name === pkgSpecifier.name);
    })
    .value();
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