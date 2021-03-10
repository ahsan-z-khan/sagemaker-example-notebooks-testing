import cdk = require("@aws-cdk/core");

import path = require("path");
const changeCase = require("change-case");
import common = require("./common");

import { DockerImageAsset } from "@aws-cdk/aws-ecr-assets";

type ImageStackProps = cdk.StackProps;

export class ImageStack extends cdk.Stack {
    readonly codeBuildImage: DockerImageAsset;

    readonly basePythonImage: DockerImageAsset;
    readonly dataScienceImage: DockerImageAsset;

    readonly mxnetImage: DockerImageAsset;
    readonly pytorchImage: DockerImageAsset;
    readonly tensorflow1Image: DockerImageAsset;
    readonly tensorflow2Image: DockerImageAsset;

    constructor(scope: cdk.App, prefix: string, props: ImageStackProps) {
        super(scope, common.stackId(prefix, "ImageStack", props), props);

        this.codeBuildImage = this.createCodeBuildImage("sagemaker-codebuild");

        this.basePythonImage = this.createProcessingImageFrom1P(
            "base-python",
            "sagemaker-base-python-environment",
            "1.0",
        );
        this.dataScienceImage = this.createProcessingImageFrom1P(
            "data-science",
            "sagemaker-data-science-environment",
            "1.0",
        );

        this.mxnetImage = this.createProcessingImageFromDlc(
            "mxnet",
            "mxnet-training",
            "1.8.0-cpu-py37-ubuntu16.04",
        );
        this.pytorchImage = this.createProcessingImageFromDlc(
            "pytorch",
            "pytorch-training",
            "1.7.1-cpu-py36-ubuntu18.04",
        );
        this.tensorflow1Image = this.createProcessingImageFromDlc(
            "tensorflow-1",
            "tensorflow-training",
            "1.15.4-cpu-py37-ubuntu18.04",
        );
        this.tensorflow2Image = this.createProcessingImageFromDlc(
            "tensorflow-2",
            "tensorflow-training",
            "2.4.1-cpu-py37-ubuntu18.04",
        );
    }

    createCodeBuildImage(name: string): DockerImageAsset {
        return new DockerImageAsset(this, "CodeBuildImage", {
            repositoryName: name,
            directory: path.join(__dirname, "images", "codebuild-image"),
        });
    }

    createProcessingImage(name: string, baseImageUri: string): DockerImageAsset {
        const pascal = changeCase.pascal(name);
        return new DockerImageAsset(this, `${pascal}ProcessingImage`, {
            repositoryName: name,
            directory: path.join(__dirname, "images", "processing-image"),
            buildArgs: {
                BASE_IMAGE: baseImageUri,
            },
        });
    }

    createProcessingImageFrom1P(
        name: string,
        baseImageRepository: string,
        baseImageTag: string,
    ): DockerImageAsset {
        return this.createProcessingImage(
            name,
            `236514542706.dkr.ecr.us-west-2.amazonaws.com/${baseImageRepository}:${baseImageTag}`,
        );
    }

    createProcessingImageFromDlc(
        name: string,
        baseImageRepository: string,
        baseImageTag: string,
    ): DockerImageAsset {
        return this.createProcessingImage(
            name,
            `763104351884.dkr.ecr.us-west-2.amazonaws.com/${baseImageRepository}:${baseImageTag}`,
        );
    }
}
