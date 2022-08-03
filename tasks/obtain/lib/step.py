import os
import json
import requests


def step(step, token):
    print(step)

    try:
        step_res = requests.post(
            f"{os.environ.get('API')}/api/upload/{step.get('upload')}/step",
            headers={"Authorization": f"bearer {token}"},
            json={
                "type": step.get("type"),
                "step": step.get("step"),
                "parent": step.get("parent"),
                "config": step.get("config"),
            },
        )

        step_res.raise_for_status()

        return step_res.json()
    except Exception as e:
        print(step_res.json())
        print(e)
        return e
