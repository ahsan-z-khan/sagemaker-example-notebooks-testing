#!/usr/bin/env python3
import argparse
import json
import os
import sys

# import sagemakerci.git
import sagemaker_run_notebook

from github import Github


def parse_args(args):
    parser = argparse.ArgumentParser(os.path.basename(__file__))
    parser.set_defaults(func=lambda x: parser.print_usage())
    parser.add_argument("--pr", help="Pull request number", type=int, required=True)

    parsed = parser.parse_args(args)
    if not parsed.pr:
        parser.error("--pr required")

    return parsed


def is_notebook(filename):
    root, ext = os.path.splitext(filename)
    if ext == ".ipynb":
        return os.path.exists(filename)


def notebook_filenames(pr_num):
    # token = sagemakerci.git.Git().oauth.token
    g = Github()  # token)
    repo = g.get_repo("aws/amazon-sagemaker-examples")
    pr = repo.get_pull(pr_num)
    return filter(is_notebook, [file.filename for file in pr.get_files()])


def main():
    args = parse_args(sys.argv[1:])

    results = {}

    for notebook in notebook_filenames(args.pr):
        results[notebook] = sagemaker_run_notebook.run(
            image="521695447989.dkr.ecr.us-west-2.amazonaws.com/dlami-image:35.0",
            notebook=notebook,
            instance_type="ml.m5.xlarge",
        )

    failures = {}

    for notebook, result in results.items():
        job_name, status, local, failure_reason = result
        print()
        print(f"********* {notebook} *********")
        print("*")
        print(f"* {'job name':>18}: {job_name:<18}")
        print("*")
        print(f"* {'status':>18}: {status:<18}")
        if status != "Completed":
            print("*")
            print(f"* {'failure reason':>18}: {failure_reason:<18}")
            print("*")
            failures[notebook] = failure_reason

    if len(failures) > 0:
        raise Exception(json.dumps(failures))


if __name__ == "__main__":
    main()
