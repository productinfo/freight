from __future__ import absolute_import

import json
import responses
import pytest

from freight import checks
from freight.exceptions import CheckFailed, CheckPending
from freight.testutils import TestCase

class CloudbuilderCheckBase(TestCase):
    def setUp(self):
        self.check = checks.get('cloudbuilder')
        self.user = self.create_user()
        self.repo = self.create_repo()
        self.app = self.create_app(repository=self.repo)
        self.test_project = "mycoolproject"
        self.test_sha = "0987654321"

class CloudbuilderContextCheckTest(CloudbuilderCheckBase):
    @responses.activate
    def test_success(self):
        body = json.dumps({
            "builds": [
            {
                "id":"thisisabuildid",
                "logUrl":"https://console.cloud.google.com/gcr/builds/thisisabuildid?project={}".format(self.test_project),
                "logsBucket":"gs://{}.cloudbuild-logs.googleusercontent.com".format(self.test_project),
                "status": "SUCCESS",
            },
            ]
        })
        responses.add(responses.GET, "https://cloudbuild.googleapis.com/v1/projects/{}/builds".format(self.test_project), body=body)

        config = {'contexts': ['cloudbuilder'], 'project': self.test_project}

        self.check.check(self.app, self.test_sha, config)


    @responses.activate
    def test_missing_repo(self):
        pass

    @responses.activate
    def test_missing_oauth(self):
        pass
    
    @responses.activate
    def test_build_pending(self):
        body = json.dumps({
            "builds": [
            {
                "id":"thisisabuildid",
                "logUrl":"https://console.cloud.google.com/gcr/builds/thisisabuildid?project={}".format(self.test_project),
                "logsBucket":"gs://{}.cloudbuild-logs.googleusercontent.com".format(self.test_project),
                "status": "PENDING",
            },
            ]
        })
        responses.add(responses.GET, "https://cloudbuild.googleapis.com/v1/projects/{}/builds".format(self.test_project), body=body)

        config = {'contexts': ['cloudbuilder'], 'project': self.test_project}

        with pytest.raises(CheckPending):
            self.check.check(self.app, self.test_sha, config)
    
    @responses.activate
    def test_build_fail(self):
        pass
