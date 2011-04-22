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
package com.google.gwt.requestfactory.shared.messages;

import com.google.gwt.autobean.shared.AutoBean;
import com.google.gwt.autobean.shared.AutoBeanFactory;

/**
 * The factory for creating RequestFactory wire messages.
 *
 * <p><span style='color:red'>RequestFactory has moved to
 * <code>com.google.web.bindery.requestfactory</code>.  This package will be
 * removed in a future version of GWT.</span></p>
 */
@Deprecated
public interface MessageFactory extends AutoBeanFactory {
  AutoBean<ServerFailureMessage> failure();

  AutoBean<IdMessage> id();

  AutoBean<InvocationMessage> invocation();

  AutoBean<JsonRpcRequest> jsonRpcRequest();

  AutoBean<OperationMessage> operation();

  AutoBean<RequestMessage> request();

  AutoBean<ResponseMessage> response();

  AutoBean<ViolationMessage> violation();
}