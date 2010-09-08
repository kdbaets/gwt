/*
 * Copyright 2010 Google Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package com.google.gwt.requestfactory;

import com.google.gwt.junit.tools.GWTTestSuite;
import com.google.gwt.requestfactory.client.EditorTest;
import com.google.gwt.requestfactory.client.RequestFactoryTest;
import com.google.gwt.requestfactory.client.impl.DeltaValueStoreJsonImplTest;
import com.google.gwt.requestfactory.client.impl.ProxyJsoImplTest;

import junit.framework.Test;

/**
 * Tests of RequestFactory that require GWT.
 */
public class RequestFactorySuite {
  public static Test suite() {
    GWTTestSuite suite = new GWTTestSuite(
        "Test suite for requestfactory gwt code.");
    suite.addTestSuite(EditorTest.class);
    suite.addTestSuite(ProxyJsoImplTest.class);
    suite.addTestSuite(DeltaValueStoreJsonImplTest.class);
    suite.addTestSuite(RequestFactoryTest.class);
    return suite;
  }
}