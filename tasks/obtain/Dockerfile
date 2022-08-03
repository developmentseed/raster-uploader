ARG PYTHON_VERSION=3.9

FROM --platform=linux/amd64 public.ecr.aws/lambda/python:${PYTHON_VERSION}

RUN pip install pip -U
COPY requirements.txt .
RUN pip install -r requirements.txt --target ${LAMBDA_TASK_ROOT}

COPY *.py ${LAMBDA_TASK_ROOT}/
COPY lib/*.py ${LAMBDA_TASK_ROOT}/lib/

CMD ["handler.handler"]
