ARG PYTHON_VERSION=3.9

FROM --platform=linux/amd64 public.ecr.aws/lambda/python:${PYTHON_VERSION}

COPY handler.py ${LAMBDA_TASK_ROOT}

RUN pip install pip -U
COPY requirements.txt .
RUN pip install -r requirements.txt --target ${LAMBDA_TASK_ROOT}

WORKDIR /asset

CMD ["handler.handler"]
