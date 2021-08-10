import codebuild = require("@aws-cdk/aws-codebuild");

import { Constants, Project, Build } from "./common";
import { Duration } from "@aws-cdk/core";

import buildspecs = require("./buildspecs");

export const projects: Project[] = [
    new Project({
        repo: Constants.exampleNotebooksRepo,
        computeType: codebuild.ComputeType.LARGE,
        timeout: Duration.minutes(120),
        releaseBuildSpec: buildspecs.createFullRepoScanBuildSpec(),
        deployBuildSpec: buildspecs.createRepoScanResultsBuildSpec(),
        enableAutomaticRelease: true,
        releasePipelineScheduleExpression: "cron(0 0 ? * * *)",
        additionalBuildProjects: [
            // new Build({
            //     name: "sagemaker-examples-notebook-instance",
            //     pullRequestBuildSpec: buildspecs.createNotebookInstanceBuildSpec(),
            //     computeType: codebuild.ComputeType.LARGE,
            // }),
            new Build({
                name: "sagemaker-examples-code-formatting",
                pullRequestBuildSpec: buildspecs.createCodeFormattingBuildSpec(),
                computeType: codebuild.ComputeType.LARGE,
            }),
            new Build({
                name: "sagemaker-examples-grammar",
                pullRequestBuildSpec: buildspecs.createGrammarBuildSpec(),
                computeType: codebuild.ComputeType.LARGE,
            }),
            new Build({
                name: "sagemaker-examples-link-check",
                pullRequestBuildSpec: buildspecs.createLinkCheckBuildSpec(),
                computeType: codebuild.ComputeType.LARGE,
            }),
        ],
    }),

    new Project({
        repo: "amazon-sagemaker-examples-staging",
        computeType: codebuild.ComputeType.LARGE,
        timeout: Duration.minutes(120),
        enableReleaseBuild: false,
        additionalBuildProjects: [
            // new Build({
            //     name: "sagemaker-examples-notebook-instance",
            //     pullRequestBuildSpec: buildspecs.createNotebookInstanceBuildSpec(),
            //     computeType: codebuild.ComputeType.LARGE,
            // }),
            // new Build({
            //     name: "sagemaker-examples-code-formatting",
            //     pullRequestBuildSpec: buildspecs.createCodeFormattingBuildSpec(),
            //     computeType: codebuild.ComputeType.LARGE,
            // }),
            // new Build({
            //     name: "sagemaker-examples-grammar",
            //     pullRequestBuildSpec: buildspecs.createGrammarBuildSpec(),
            //     computeType: codebuild.ComputeType.LARGE,
            // }),
        ],
    }),
];
