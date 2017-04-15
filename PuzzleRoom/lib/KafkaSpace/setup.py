#!/usr/bin/env python

from distutils.core import setup

setup(name='Kafka-Interface',
      version='1.0',
      description='Simple wrapper for Kafak Producer and Consumer that allows the developer to quickly developer a simple Kafka app',
      author='Benjamin Smith',
      author_email='benjamindsmith3@gmail.com',
      url='https://github.com/insatiableben'
      packages=['kafka-python' ],
     )
